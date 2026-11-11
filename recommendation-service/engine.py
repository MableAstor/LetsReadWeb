
"""Transparent content-based recommender for Let's Read v3.1.

Persistent user preferences come only from Supabase User_Preferences.
Book features come from catalogue categories and subcategories.
"""
from __future__ import annotations

import math
import random
import re
from typing import Any, Iterable

MAIN_WEIGHT = 0.60
SUBCATEGORY_WEIGHT = 0.40

EXPLOITATION_RATE = 0.80
EXPLORATION_RATE = 0.20
EXPLORATION_MIN_SCORE = 0.05

SUBCATEGORY_COVERAGE_THRESHOLD = 0.70
DIVERSITY_WEIGHT = 0.08
MMR_RELEVANCE_WEIGHT = 0.80

ENGINE_VERSION = "cbf-python-3.2-session-first"
SESSION_PROFILE_WEIGHT = 0.80
HISTORY_PROFILE_WEIGHT = 0.20

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

    result = []
    seen = set()

    for item in raw:
        label = str(item).strip()
        key = label.casefold()

        if label and key not in seen:
            result.append(label)
            seen.add(key)

    return result


def categories_of(book: dict[str, Any]) -> list[str]:
    return _labels_from_value(
        book.get("categories")
        or book.get("category")
        or book.get("Categorise_Name")
        or book.get("main_categories")
    )


def subcategories_of(book: dict[str, Any]) -> list[str]:
    return _labels_from_value(
        book.get("subcategories")
        or book.get("subCategory")
        or book.get("sub_category")
        or book.get("Subcategorise_Name")
    )


def book_key(book: dict[str, Any]) -> str:
    value = book.get(
        "id",
        book.get(
            "BooksID",
            book.get(
                "book_id",
                book.get("title", book.get("Books_title", "")),
            ),
        ),
    )
    return str(value).strip()


def _norm_labels(labels: Iterable[str]) -> list[str]:
    if isinstance(labels, str):
        labels = [labels]

    return [
        label.strip().casefold()
        for label in labels
        if isinstance(label, str) and label.strip()
    ]


def _norm2(vector: Vector) -> Vector:
    norm = math.sqrt(sum(value * value for value in vector.values()))

    if norm <= 1e-12:
        return {}

    return {
        key: value / norm
        for key, value in vector.items()
        if abs(value / norm) > 1e-12
    }


def _feature_mode(
    pool: list[dict[str, Any]],
) -> tuple[bool, float]:
    if not pool:
        return False, 0.0

    coverage = (
        sum(bool(subcategories_of(book)) for book in pool)
        / len(pool)
    )

    # Use available subcategory features even when catalogue coverage is low.
    use_sub = coverage > 0

    return use_sub, coverage


def book_vector(
    book: dict[str, Any],
    use_subcategories: bool = True,
) -> Vector:
    """Represent a book with 60% main and 40% subcategory weight."""
    vector: Vector = {}

    mains = _norm_labels(categories_of(book))
    subs = (
        _norm_labels(subcategories_of(book))
        if use_subcategories
        else []
    )

    if mains:
        weight = math.sqrt(MAIN_WEIGHT) / math.sqrt(len(mains))

        for label in mains:
            vector[("main", label)] = weight

    if subs:
        weight = (
            math.sqrt(SUBCATEGORY_WEIGHT)
            / math.sqrt(len(subs))
        )

        for label in subs:
            vector[("sub", label)] = weight

    return _norm2(vector)


def seed_vector(
    selected_categories: list[str],
    selected_subcategories: list[str],
    use_subcategories: bool = True,
) -> Vector:
    return book_vector(
        {
            "categories": selected_categories,
            "subcategories": (
                selected_subcategories if use_subcategories else []
            ),
        },
        use_subcategories=use_subcategories,
    )


def _preference_kind(item: dict[str, Any]) -> str | None:
    raw = str(
        item.get("type")
        or item.get("kind")
        or item.get("level")
        or item.get("feature_type")
        or ""
    ).strip().casefold()

    if raw in {"main", "category", "categorise", "categoriseid"}:
        return "main"

    if raw in {
        "sub",
        "subcategory",
        "subcategorise",
        "subcategoriseid",
    }:
        return "sub"

    has_main = item.get("CategoriseID") is not None
    has_sub = item.get("SubcategoriseID") is not None

    if has_main and not has_sub:
        return "main"

    if has_sub and not has_main:
        return "sub"

    return None


def _preference_label(
    item: dict[str, Any],
    kind: str,
) -> str:
    keys = (
        ("label", "name", "Categorise_Name", "category")
        if kind == "main"
        else (
            "label",
            "name",
            "Subcategorise_Name",
            "subcategory",
            "subCategory",
        )
    )

    for key in keys:
        value = item.get(key)

        if value is not None and str(value).strip():
            return str(value).strip().casefold()

    return ""


def _preference_value(item: dict[str, Any]) -> float:
    raw = item.get(
        "Preference_Value",
        item.get(
            "preference_value",
            item.get("value", item.get("score", 0)),
        ),
    )

    try:
        value = float(raw)
    except (TypeError, ValueError):
        return 0.0

    # Accept legacy percentage values.
    if abs(value) > 1.0:
        value /= 100.0

    return max(-1.0, min(1.0, value))


def _flatten_preferences(
    preferences: Any,
) -> list[dict[str, Any]]:
    if isinstance(preferences, list):
        return [item for item in preferences if isinstance(item, dict)]

    if not isinstance(preferences, dict):
        return []

    flattened = []

    for item in preferences.get("main", []) or []:
        if isinstance(item, dict):
            flattened.append({**item, "type": "main"})

    for item in (
        preferences.get("sub", [])
        or preferences.get("subcategories", [])
        or []
    ):
        if isinstance(item, dict):
            flattened.append({**item, "type": "sub"})

    return flattened


def preference_vector(
    preferences: list[dict[str, Any]],
    use_subcategories: bool = True,
) -> Vector:
    """Normalize main and subcategory preference groups independently.

    Negative and positive values remain in the same group vector.
    This prevents the number of categories in one group from changing
    the intended 60:40 balance between feature groups.
    """
    groups: dict[str, Vector] = {
        "main": {},
        "sub": {},
    }

    for item in _flatten_preferences(preferences):
        kind = _preference_kind(item)

        if kind is None:
            continue

        if kind == "sub" and not use_subcategories:
            continue

        label = _preference_label(item, kind)
        value = _preference_value(item)

        if not label or abs(value) <= 1e-12:
            continue

        feature = (kind, label)
        groups[kind][feature] = (
            groups[kind].get(feature, 0.0) + value
        )

    main_vector = _norm2(groups["main"])
    sub_vector = _norm2(groups["sub"])

    combined: Vector = {}

    for feature, value in main_vector.items():
        combined[feature] = value * math.sqrt(MAIN_WEIGHT)

    for feature, value in sub_vector.items():
        combined[feature] = value * math.sqrt(SUBCATEGORY_WEIGHT)

    return _norm2(combined)


def cosine_similarity(left: Vector, right: Vector) -> float:
    if not left or not right:
        return 0.0

    if len(left) > len(right):
        left, right = right, left

    dot = sum(
        value * right.get(feature, 0.0)
        for feature, value in left.items()
    )

    left_norm = math.sqrt(sum(v * v for v in left.values()))
    right_norm = math.sqrt(sum(v * v for v in right.values()))

    if left_norm <= 1e-12 or right_norm <= 1e-12:
        return 0.0

    return max(-1.0, min(1.0, dot / (left_norm * right_norm)))


def _outside_selected_main(
    book: dict[str, Any],
    selected_categories: list[str],
) -> bool:
    selected = set(_norm_labels(selected_categories))
    book_mains = set(_norm_labels(categories_of(book)))

    return bool(book_mains) and book_mains.isdisjoint(selected)


def _recent_exposure_counts(
    swiped: list[dict[str, Any]],
) -> tuple[dict[str, int], dict[str, int]]:
    main_counts: dict[str, int] = {}
    sub_counts: dict[str, int] = {}

    for book in (swiped or [])[-8:]:
        if not isinstance(book, dict):
            continue

        for label in _norm_labels(categories_of(book)):
            main_counts[label] = main_counts.get(label, 0) + 1

        for label in _norm_labels(subcategories_of(book)):
            sub_counts[label] = sub_counts.get(label, 0) + 1

    return main_counts, sub_counts


def _diversity_penalty(
    book: dict[str, Any],
    exposure: tuple[dict[str, int], dict[str, int]],
    use_subcategories: bool,
) -> float:
    main_counts, sub_counts = exposure

    mains = _norm_labels(categories_of(book))
    subs = (
        _norm_labels(subcategories_of(book))
        if use_subcategories
        else []
    )

    penalties = []

    for label in mains:
        penalties.append(min(main_counts.get(label, 0), 3) / 3.0)

    for label in subs:
        penalties.append(min(sub_counts.get(label, 0), 3) / 3.0)

    if not penalties:
        return 0.0

    return DIVERSITY_WEIGHT * (sum(penalties) / len(penalties))


def _metadata(
    pool: list[dict[str, Any]],
    use_subcategories: bool,
    coverage: float,
    candidate_count: int,
    ranked_count: int,
    preference_count: int,
) -> dict[str, Any]:
    return {
        "engine_version": ENGINE_VERSION,
        "preference_source": "supabase_user_preferences",
        "preference_count": preference_count,
        "feature_mode": (
            "main_plus_subcategory"
            if use_subcategories
            else "main_only"
        ),
        "main_weight": MAIN_WEIGHT if use_subcategories else 1.0,
        "subcategory_weight": (
            SUBCATEGORY_WEIGHT if use_subcategories else 0.0
        ),
        "exploitation_rate": EXPLOITATION_RATE,
        "exploration_rate": EXPLORATION_RATE,
        "exploration_min_score": EXPLORATION_MIN_SCORE,
        "diversity_weight": DIVERSITY_WEIGHT,
        "subcategory_coverage": round(coverage, 4),
        "candidate_count": candidate_count,
        "ranked_count": ranked_count,
        "method": (
            "User_Preferences + group-normalized feature vectors "
            "+ cosine similarity + guided cross-category exploration"
        ),
    }


def _build_profile(
    preferences: list[dict[str, Any]],
    selected_categories: list[str],
    selected_subcategories: list[str],
    use_subcategories: bool,
) -> tuple[Vector, str]:
    # The current session always contributes to the profile. Persisted
    # preferences refine relevance; they never replace session selection.
    history = preference_vector(preferences, use_subcategories)
    session = seed_vector(
        selected_categories, selected_subcategories, use_subcategories
    )
    if not session:
        return history, "user_preferences_no_session_selection"
    if not history:
        return session, "selected_session"

    combined = {
        feature: SESSION_PROFILE_WEIGHT * session.get(feature, 0.0)
        + HISTORY_PROFILE_WEIGHT * history.get(feature, 0.0)
        for feature in set(session) | set(history)
    }
    return _norm2(combined), "session_plus_user_preferences"


def _preference_count(preferences: Any) -> int:
    return len(_flatten_preferences(preferences))


def _score_candidates(
    books: list[dict[str, Any]],
    profile: Vector,
    swiped: list[dict[str, Any]],
    use_subcategories: bool,
) -> list[tuple[float, float, dict[str, Any]]]:
    exposure = _recent_exposure_counts(swiped)
    scored = []

    for book in books:
        vector = book_vector(book, use_subcategories)
        preference_score = cosine_similarity(vector, profile)

        penalty = _diversity_penalty(
            book,
            exposure,
            use_subcategories,
        )

        final_score = preference_score - penalty

        result = dict(book)
        result["_preference_score"] = preference_score
        result["_diversity_penalty"] = penalty

        scored.append((final_score, preference_score, result))

    scored.sort(
        key=lambda item: (item[0], book_key(item[2])),
        reverse=True,
    )

    return scored


def _public_book(
    selected: tuple[float, float, dict[str, Any]],
    source: str,
    reason: str,
) -> dict[str, Any]:
    final_score, preference_score, original = selected
    book = dict(original)

    penalty = book.pop("_diversity_penalty", 0.0)
    book.pop("_preference_score", None)

    book.update({
        "score": round(final_score, 6),
        "preferenceScore": round(preference_score, 6),
        "diversityPenalty": round(penalty, 6),
        "recommendationReason": reason,
        "recommendationSource": source,
    })

    return book


def select_next_book(
    payload: dict[str, Any],
    random_value: float | None = None,
) -> dict[str, Any]:
    preferences = payload.get("preferences") or []
    swiped = payload.get("swiped") or []
    pool = payload.get("pool") or []

    selected_categories = payload.get("selected_categories") or []
    selected_subcategories = payload.get("selected_subcategories") or []

    use_sub, coverage = _feature_mode(pool)
    preference_count = _preference_count(preferences)

    swiped_ids = {
        book_key(book)
        for book in swiped
        if isinstance(book, dict) and book_key(book)
    }

    candidates = [
        book for book in pool
        if (
            isinstance(book, dict)
            and book_key(book)
            and book_key(book) not in swiped_ids
        )
    ]

    profile, profile_source = _build_profile(
        preferences,
        selected_categories,
        selected_subcategories,
        use_sub,
    )

    if not candidates:
        return {
            "book": None,
            "metadata": _metadata(
                pool, use_sub, coverage, 0, 0, preference_count
            ) | {
                "selection_mode": "exhausted",
                "profile_source": profile_source,
            },
        }

    selected_main = set(_norm_labels(selected_categories))
    selected_sub = set(_norm_labels(selected_subcategories))

    # Strict session-first ordering: exact main+sub, then main, then
    # relevant outside-category fallback. Historical scores cannot
    # promote a book from a lower-priority group.
    exact_books = []
    main_only_books = []
    outside_books = []
    for book in candidates:
        book_main = set(_norm_labels(categories_of(book)))
        book_sub = set(_norm_labels(subcategories_of(book)))
        if not selected_main or book_main & selected_main:
            if not selected_sub or book_sub & selected_sub:
                exact_books.append(book)
            else:
                main_only_books.append(book)
        else:
            outside_books.append(book)

    exact_scored = _score_candidates(exact_books, profile, swiped, use_sub)
    main_scored = _score_candidates(main_only_books, profile, swiped, use_sub)
    outside_scored = _score_candidates(outside_books, profile, swiped, use_sub)
    guided_exploration = [
        item for item in outside_scored
        if item[1] >= EXPLORATION_MIN_SCORE and item[1] > 0
    ]

    if exact_scored:
        selected_group = exact_scored
        source = "session_main_and_sub"
        reason = "ตรงหมวดหลักและหมวดรองที่เลือกใน Session ปัจจุบัน"
    elif main_scored:
        selected_group = main_scored
        source = "session_main"
        reason = "ตรงหมวดหลักที่เลือกใน Session ปัจจุบัน"
    elif guided_exploration:
        selected_group = guided_exploration
        source = "exploration_fallback"
        reason = "หนังสือในหมวดที่เลือกหมดแล้ว จึงแนะนำหมวดอื่นที่เกี่ยวข้อง"
    else:
        return {
            "book": None,
            "metadata": _metadata(
                pool, use_sub, coverage, 0, len(candidates), preference_count
            ) | {
                "selection_mode": "no_relevant_candidate",
                "profile_source": profile_source,
                "primary_candidate_count": 0,
                "outside_candidate_count": len(outside_scored),
                "guided_exploration_count": 0,
            },
        }

    # Keep relevance ranking and diversity penalty; exploration is only
    # used after the selected categories are exhausted.
    selection_pool = selected_group

    selected = selection_pool[0]

    result_book = _public_book(selected, source, reason)

    return {
        "book": result_book,
        "metadata": _metadata(
            pool,
            use_sub,
            coverage,
            len(exact_scored) + len(main_scored) + len(guided_exploration),
            len(candidates),
            preference_count,
        ) | {
            "selection_mode": source,
            "profile_source": profile_source,
            "selected_score": result_book["score"],
            "preference_score": result_book["preferenceScore"],
            "diversity_penalty": result_book["diversityPenalty"],
            "exploration_available": bool(guided_exploration),
            "guided_exploration_count": len(guided_exploration),
            "outside_candidate_count": len(outside_scored),
            "primary_candidate_count": len(exact_scored) + len(main_scored),
            "selected_main_categories": selected_categories,
            "selected_subcategories": selected_subcategories,
            "exact_candidate_count": len(exact_scored),
            "main_only_candidate_count": len(main_scored),
        },
    }


def _mmr_select(
    ranked: list[dict[str, Any]],
    use_subcategories: bool,
    limit: int = 3,
) -> list[dict[str, Any]]:
    remaining = list(ranked)
    selected = []
    selected_vectors: list[Vector] = []

    while remaining and len(selected) < limit:
        best_index = 0
        best_score = float("-inf")

        for index, book in enumerate(remaining):
            relevance = float(book.get("score", 0.0))
            vector = book_vector(book, use_subcategories)

            redundancy = max(
                (
                    cosine_similarity(vector, chosen)
                    for chosen in selected_vectors
                ),
                default=0.0,
            )

            mmr_score = (
                MMR_RELEVANCE_WEIGHT * relevance
                + (1.0 - MMR_RELEVANCE_WEIGHT)
                * (1.0 - redundancy)
            )

            if mmr_score > best_score:
                best_score = mmr_score
                best_index = index

        chosen = remaining.pop(best_index)
        selected.append(chosen)
        selected_vectors.append(
            book_vector(chosen, use_subcategories)
        )

    return selected


def rank_liked_books(payload: dict[str, Any]) -> dict[str, Any]:
    """Rank liked books using persisted preferences and diversify TOP 3."""
    preferences = payload.get("preferences") or []
    likes = payload.get("likes") or []
    pool = payload.get("pool") or []

    selected_categories = payload.get("selected_categories") or []
    selected_subcategories = payload.get("selected_subcategories") or []

    use_sub, coverage = _feature_mode(pool or likes)
    preference_count = _preference_count(preferences)

    if not likes:
        return {
            "recommendations": [],
            "discovery": None,
            "discovery_books": [],
            "metadata": _metadata(
                pool,
                use_sub,
                coverage,
                len(pool),
                0,
                preference_count,
            ) | {
                "result_source": "liked_books_only",
                "message": "ยังไม่มีหนังสือที่กดใจ",
            },
        }

    profile, profile_source = _build_profile(
        preferences,
        selected_categories,
        selected_subcategories,
        use_sub,
    )

    ranked = []

    for book in likes:
        if not isinstance(book, dict):
            continue

        score = cosine_similarity(
            book_vector(book, use_sub),
            profile,
        )

        item = dict(book)
        item.update({
            "score": round(score, 6),
            "preferenceScore": round(score, 6),
            "recommendationReason": (
                "จัดอันดับจาก Preference ที่คำนวณและจัดเก็บใน Supabase"
            ),
            "recommendationSource": "liked_book_rank",
        })

        ranked.append(item)

    ranked.sort(
        key=lambda book: (
            book.get("score", 0.0),
            book_key(book),
        ),
        reverse=True,
    )

    top_three = _mmr_select(ranked, use_sub, limit=3)

    discovery_books = [
        book for book in ranked
        if _outside_selected_main(book, selected_categories)
    ]

    metadata = _metadata(
        pool or likes,
        use_sub,
        coverage,
        len(likes),
        len(top_three),
        preference_count,
    ) | {
        "result_source": "liked_books_only",
        "profile_source": profile_source,
        "liked_count": len(likes),
        "discovery_liked_count": len(discovery_books),
        "top_three_source": "user_liked_books",
        "top_three_diversification": "MMR",
        "message": (
            "TOP 3 มาจากหนังสือที่ผู้ใช้กดใจจริง "
            "และจัดอันดับด้วย Preference จาก Supabase"
        ),
    }

    return {
        "recommendations": top_three,
        "discovery": (
            discovery_books[0] if discovery_books else None
        ),
        "discovery_books": discovery_books,
        "metadata": metadata,
    }
