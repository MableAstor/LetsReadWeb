"""Transparent content-based recommender for Let's Read.

Persistent user interest is sourced ONLY from Supabase User_Preferences.
Swipe history is used only to exclude already-seen books; liked/disliked book
lists are not used to construct or alter the preference profile.

Expected preference row fields:
- Preference_Value
- Categorise_Name / category / main_category (or equivalent)
- Subcategorise_Name / subcategory / sub_category (or equivalent)

Book features come from catalogue categories + subcategories.
"""
from __future__ import annotations

import math
import random
import re
from typing import Any, Iterable

MAIN_WEIGHT = 0.60
SUBCATEGORY_WEIGHT = 0.40
EXPLORATION_RATE = 0.20
SUBCATEGORY_COVERAGE_THRESHOLD = 0.70
ENGINE_VERSION = "cbf-python-3.2"

Feature = tuple[str, str]
Vector = dict[Feature, float]


def _labels_from_value(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        raw = re.split(r"[•|,;]", value)
    elif isinstance(value, (list, tuple, set)):
        raw = []
        for item in value:
            if isinstance(item, str):
                raw.extend(re.split(r"[•|,;]", item))
            elif item is not None:
                raw.append(str(item))
    else:
        raw = [str(value)]

    result: list[str] = []
    seen: set[str] = set()
    for item in raw:
        label = str(item).strip()
        key = label.casefold()
        if label and key not in seen:
            result.append(label)
            seen.add(key)
    return result


def _first_value(data: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        value = data.get(key)
        if value is not None and value != "":
            return value
    return None


def categories_of(book: dict[str, Any]) -> list[str]:
    return _labels_from_value(_first_value(
        book, "categories", "category", "Categorise_Name",
        "main_categories", "main_category",
    ))


def subcategories_of(book: dict[str, Any]) -> list[str]:
    return _labels_from_value(_first_value(
        book, "subcategories", "subCategory", "sub_category",
        "Subcategorise_Name", "subcategory",
    ))


def book_key(book: dict[str, Any]) -> str:
    value = _first_value(book, "id", "BooksID", "book_id", "title", "Books_title")
    return str(value).strip() if value is not None else ""


def _norm_labels(labels: Iterable[str]) -> list[str]:
    return [label.strip().casefold() for label in labels if label and label.strip()]


def _norm2(vector: Vector) -> Vector:
    norm = math.sqrt(sum(value * value for value in vector.values()))
    if norm <= 1e-12:
        return {}
    return {key: value / norm for key, value in vector.items() if abs(value / norm) > 1e-12}


def _feature_mode(pool: list[dict[str, Any]]) -> tuple[bool, float]:
    if not pool:
        return False, 0.0
    coverage = sum(bool(subcategories_of(book)) for book in pool) / len(pool)
    return any(subcategories_of(book) for book in pool) and coverage >= SUBCATEGORY_COVERAGE_THRESHOLD, coverage


def book_vector(book: dict[str, Any], use_subcategories: bool = True) -> Vector:
    """Create a unit vector with main-category and subcategory feature groups."""
    vector: Vector = {}
    mains = _norm_labels(categories_of(book))
    subs = _norm_labels(subcategories_of(book)) if use_subcategories else []

    if mains:
        weight = math.sqrt(MAIN_WEIGHT / len(mains))
        for label in mains:
            vector[("main", label)] = weight
    if subs:
        weight = math.sqrt(SUBCATEGORY_WEIGHT / len(subs))
        for label in subs:
            vector[("sub", label)] = weight
    return _norm2(vector)


def cosine_similarity(left: Vector, right: Vector) -> float:
    if not left or not right:
        return 0.0
    if len(left) > len(right):
        left, right = right, left
    dot = sum(value * right.get(feature, 0.0) for feature, value in left.items())
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if left_norm <= 1e-12 or right_norm <= 1e-12:
        return 0.0
    return max(-1.0, min(1.0, dot / (left_norm * right_norm)))


def _preference_labels(row: dict[str, Any], kind: str) -> list[str]:
    # Supports both named Supabase categories and the historical Express
    # transport {type: "main"|"sub", label: "..."}.
    row_type = str(_first_value(row, "type", "kind", "level") or "").strip().casefold()
    typed_label = row.get("label") if row_type in (
        {"main", "category", "categorise"} if kind == "main"
        else {"sub", "subcategory", "subcategorise"}
    ) else None
    if kind == "main":
        return _labels_from_value(_first_value(
            row, "category", "categories", "main_category", "main_categories",
            "Categorise_Name", "categorise_name", "category_name",
            "Category_Name", "CategoryName",
        ) or typed_label)
    return _labels_from_value(_first_value(
        row, "subcategory", "subcategories", "sub_category",
        "Subcategorise_Name", "subcategorise_name", "subcategory_name",
        "Subcategory_Name", "SubcategoryName",
    ) or typed_label)


def _preference_value(row: dict[str, Any]) -> float:
    raw = _first_value(row, "Preference_Value", "preference_value", "value", "score")
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return 0.0
    return value if math.isfinite(value) else 0.0


def preference_vector(
    user_preferences: list[dict[str, Any]],
    use_subcategories: bool = True,
) -> Vector:
    """Build profile from Supabase User_Preferences only.

    Positive and negative values are retained. Each feature group is scaled
    independently before the final normalization so a user with many
    subcategory rows does not automatically overwhelm their main interests.
    """
    group_values: dict[str, dict[str, float]] = {"main": {}, "sub": {}}

    for row in user_preferences or []:
        if not isinstance(row, dict):
            continue
        value = _preference_value(row)
        if abs(value) <= 1e-12:
            continue

        for label in _preference_labels(row, "main"):
            key = label.casefold()
            group_values["main"][key] = group_values["main"].get(key, 0.0) + value

        if use_subcategories:
            for label in _preference_labels(row, "sub"):
                key = label.casefold()
                group_values["sub"][key] = group_values["sub"].get(key, 0.0) + value

    vector: Vector = {}
    for group, values in group_values.items():
        if not values:
            continue
        # L2-normalize within each group, then apply the group's configured weight.
        norm = math.sqrt(sum(value * value for value in values.values()))
        if norm <= 1e-12:
            continue
        group_weight = math.sqrt(MAIN_WEIGHT if group == "main" else SUBCATEGORY_WEIGHT)
        for label, value in values.items():
            vector[(group, label)] = group_weight * value / norm

    return _norm2(vector)


def _outside_selected_main(book: dict[str, Any], selected_categories: list[str]) -> bool:
    selected = set(_norm_labels(selected_categories))
    book_mains = set(_norm_labels(categories_of(book)))
    return bool(book_mains) and book_mains.isdisjoint(selected)


def _metadata(
    use_subcategories: bool,
    coverage: float,
    candidate_count: int,
    ranked_count: int,
    preference_count: int,
) -> dict[str, Any]:
    return {
        "engine_version": ENGINE_VERSION,
        "preference_source": "supabase_user_preferences",
        "feature_mode": "main_plus_subcategory" if use_subcategories else "main_only",
        "main_weight": MAIN_WEIGHT if use_subcategories else 1.0,
        "subcategory_weight": SUBCATEGORY_WEIGHT if use_subcategories else 0.0,
        "subcategory_coverage": round(coverage, 4),
        "candidate_count": candidate_count,
        "ranked_count": ranked_count,
        "preference_count": preference_count,
        "method": "User_Preferences weighted feature profile + L2 normalization + cosine similarity",
        "message": (
            "คะแนนความสนใจมาจาก Supabase User_Preferences โดยถ่วงหมวดหลัก 60% "
            "และหมวดรอง 40%; ปรับสเกลแต่ละกลุ่มก่อนรวมเพื่อไม่ให้จำนวนหมวดที่มากกว่าได้เปรียบ"
            if use_subcategories else
            "คะแนนความสนใจมาจาก Supabase User_Preferences และใช้เฉพาะหมวดหลัก "
            "เนื่องจากข้อมูลหมวดรองยังไม่ครอบคลุมเกณฑ์"
        ),
    }


def _get_preferences(payload: dict[str, Any]) -> list[dict[str, Any]]:
    rows = payload.get("user_preferences")
    if rows is None:
        rows = payload.get("preferences")
    return rows if isinstance(rows, list) else []


def _score_book(book: dict[str, Any], profile: Vector, use_sub: bool) -> float:
    return cosine_similarity(book_vector(book, use_sub), profile)


def select_next_book(
    payload: dict[str, Any],
    random_value: float | None = None,
) -> dict[str, Any]:
    """Select the next swipe book using User_Preferences as the sole taste profile."""
    preferences = _get_preferences(payload)
    swiped = payload.get("swiped") or []
    pool = payload.get("pool") or []
    selected_categories = payload.get("selected_categories") or []
    selected_subcategories = payload.get("selected_subcategories") or []

    use_sub, coverage = _feature_mode(pool)
    profile = preference_vector(preferences, use_sub)

    swiped_ids = {book_key(book) for book in swiped if isinstance(book, dict) and book_key(book)}
    candidates = [
        book for book in pool
        if isinstance(book, dict) and book_key(book) and book_key(book) not in swiped_ids
    ]

    base_metadata = _metadata(use_sub, coverage, 0, 0, len(preferences))
    if not candidates:
        return {"book": None, "metadata": base_metadata | {"selection_mode": "exhausted"}}

    scored = [((_score_book(book, profile, use_sub)), book) for book in candidates]
    scored.sort(key=lambda item: (item[0], book_key(item[1])), reverse=True)

    selected_main = set(_norm_labels(selected_categories))
    if selected_main:
        primary = [
            item for item in scored
            if selected_main.intersection(_norm_labels(categories_of(item[1])))
        ]
        outside = [
            item for item in scored
            if _outside_selected_main(item[1], selected_categories)
        ]
    else:
        primary, outside = scored, []

    fallback = not primary
    eligible = outside if fallback else primary
    # New users have no persisted preference profile yet. Use the selected
    # subcategories only to choose a sensible FIRST book, not to train a
    # preference vector. Once User_Preferences has data, only it drives scores.
    cold_start_sub_filter = False
    if not profile and selected_subcategories and eligible:
        selected_sub = set(_norm_labels(selected_subcategories))
        sub_matches = [
            item for item in eligible
            if selected_sub.intersection(_norm_labels(subcategories_of(item[1])))
        ]
        if sub_matches:
            eligible = sub_matches
            cold_start_sub_filter = True
    if not eligible:
        return {
            "book": None,
            "metadata": _metadata(use_sub, coverage, 0, len(scored), len(preferences))
            | {"selection_mode": "exhausted", "message": "ไม่มีหนังสือที่ยังไม่เคยปัดเหลืออยู่"},
        }

    exploration_available = bool(swiped) and not fallback and bool(outside)
    random_number = random.random() if random_value is None else random_value
    explore = exploration_available and random_number < EXPLORATION_RATE

    if explore:
        explore_count = max(1, math.ceil(len(outside) * EXPLORATION_RATE))
        score, selected = random.choice(outside[:explore_count])
        source = "exploration"
        reason = "ทดลองแนะนำหมวดหลักอื่น โดยจัดอันดับจากโปรไฟล์ User_Preferences"
    else:
        score, selected = eligible[0]
        source = "fallback" if fallback else "exploitation"
        reason = (
            "หมวดหลักที่เลือกไม่มีหนังสือเหลือ จึงแนะนำจากหมวดหลักอื่นตาม User_Preferences"
            if fallback else
            "เลือกหนังสือคะแนนความสอดคล้องสูงสุดภายในหมวดหลักที่เลือก ตาม User_Preferences"
        )

    result_book = dict(selected)
    result_book.update({
        "score": round(score, 6),
        "positiveScore": round(score, 6),
        "dislikeSimilarity": None,
        "recommendationReason": reason,
        "recommendationSource": source,
    })
    return {
        "book": result_book,
        "metadata": _metadata(use_sub, coverage, len(eligible), len(scored), len(preferences))
        | {
            "selection_mode": source,
            "selected_score": round(score, 6),
            "exploration_available": exploration_available,
            "outside_candidate_count": len(outside),
            "primary_candidate_count": len(primary),
            "selected_main_categories": selected_categories,
            "fallback_mode": fallback,
            "cold_start_subcategory_filter": cold_start_sub_filter,
        },
    }


def rank_liked_books(payload: dict[str, Any]) -> dict[str, Any]:
    """Rank already-liked books for display; their likes do NOT train the profile."""
    likes = payload.get("likes") or []
    pool = payload.get("pool") or []
    preferences = _get_preferences(payload)
    selected_categories = payload.get("selected_categories") or []

    use_sub, coverage = _feature_mode(pool or likes)
    profile = preference_vector(preferences, use_sub)

    if not likes:
        return {
            "recommendations": [],
            "discovery": None,
            "discovery_books": [],
            "metadata": _metadata(use_sub, coverage, 0, 0, len(preferences))
            | {"result_source": "liked_books_only", "message": "ยังไม่มีหนังสือที่กดใจ"},
        }

    ranked: list[dict[str, Any]] = []
    for book in likes:
        if not isinstance(book, dict):
            continue
        score = _score_book(book, profile, use_sub)
        item = dict(book)
        item.update({
            "score": round(score, 6),
            "recommendationReason": "จัดอันดับหนังสือที่กดใจตามโปรไฟล์ Supabase User_Preferences",
            "recommendationSource": "liked_book_rank",
        })
        ranked.append(item)

    ranked.sort(key=lambda book: (book.get("score", 0.0), book_key(book)), reverse=True)
    top_three = ranked[:3]
    discovery_books = [book for book in ranked if _outside_selected_main(book, selected_categories)]

    return {
        "recommendations": top_three,
        "discovery": discovery_books[0] if discovery_books else None,
        "discovery_books": discovery_books,
        "metadata": _metadata(use_sub, coverage, len(likes), len(top_three), len(preferences))
        | {
            "result_source": "liked_books_only",
            "liked_count": len(likes),
            "discovery_liked_count": len(discovery_books),
            "top_three_source": "user_liked_books_ranked_by_user_preferences",
            "message": "แสดงหนังสือที่กดใจจริง โดยเรียงตาม User_Preferences; ไม่ใช้ Likes/Dislikes สร้างโปรไฟล์ความสนใจ",
        },
    }
