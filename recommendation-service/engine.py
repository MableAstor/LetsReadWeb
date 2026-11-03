
"""Transparent content-based recommender for Let's Read.

This module deliberately uses only Python's standard library. Book features come
from the Supabase catalogue payload: categories + subcategories.
"""
from __future__ import annotations

import math
import random
import re
from typing import Any, Iterable

MAIN_WEIGHT = 0.60
SUBCATEGORY_WEIGHT = 0.40
DISLIKE_PENALTY = 0.75
EXPLORATION_RATE = 0.20
SUBCATEGORY_COVERAGE_THRESHOLD = 0.70
ENGINE_VERSION = "cbf-python-2.0"

Feature = tuple[str, str]
Vector = dict[Feature, float]


def _labels_from_value(value: Any) -> list[str]:
    """Normalize a label or a list of labels to unique trimmed strings."""
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
    return [label.strip().casefold() for label in labels if label and label.strip()]


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
    likes: list[dict[str, Any]] | None = None,
) -> tuple[bool, float]:
    if not pool:
        return False, 0.0

    with_sub = sum(bool(subcategories_of(book)) for book in pool)
    coverage = with_sub / len(pool)
    has_any_sub = any(subcategories_of(book) for book in pool)
    use_sub = has_any_sub and coverage >= SUBCATEGORY_COVERAGE_THRESHOLD

    return use_sub, coverage


def book_vector(
    book: dict[str, Any],
    use_subcategories: bool = True,
) -> Vector:
    """Create an L2-normalized feature vector.

    Each feature group contributes squared weight 0.60 (main) / 0.40 (sub).
    Within a group, weight is spread evenly across all labels on that book.
    A final L2 normalization gives a cosine-comparable vector.
    """
    vector: Vector = {}

    mains = _norm_labels(categories_of(book))
    subs = _norm_labels(subcategories_of(book)) if use_subcategories else []

    if mains:
        weight = math.sqrt(MAIN_WEIGHT) / math.sqrt(len(mains))
        for label in mains:
            vector[("main", label)] = weight

    if subs:
        weight = math.sqrt(SUBCATEGORY_WEIGHT) / math.sqrt(len(subs))
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
            "subcategories": selected_subcategories if use_subcategories else [],
        },
        use_subcategories=use_subcategories,
    )


def preference_vector(
    likes: list[dict[str, Any]],
    dislikes: list[dict[str, Any]],
    selected_categories: list[str],
    selected_subcategories: list[str],
    use_subcategories: bool = True,
) -> Vector:
    """Seed profile + positive liked-book vectors - penalized disliked vectors."""
    aggregate: Vector = {}

    def add(vector: Vector, factor: float) -> None:
        for feature, value in vector.items():
            aggregate[feature] = (
                aggregate.get(feature, 0.0) + factor * value
            )

    start = seed_vector(
        selected_categories,
        selected_subcategories,
        use_subcategories,
    )

    if start:
        add(start, 1.0)

    for book in likes:
        add(book_vector(book, use_subcategories), 1.0)

    for book in dislikes:
        add(book_vector(book, use_subcategories), -DISLIKE_PENALTY)

    return _norm2(aggregate)


def cosine_similarity(left: Vector, right: Vector) -> float:
    if not left or not right:
        return 0.0

    if len(left) > len(right):
        left, right = right, left

    dot = sum(
        value * right.get(feature, 0.0)
        for feature, value in left.items()
    )

    # Both vectors are normalized, but this guards against future changes.
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))

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


def _metadata(
    pool: list[dict[str, Any]],
    use_subcategories: bool,
    coverage: float,
    candidate_count: int,
    ranked_count: int,
) -> dict[str, Any]:
    return {
        "engine_version": ENGINE_VERSION,
        "feature_mode": (
            "main_plus_subcategory" if use_subcategories else "main_only"
        ),
        "main_weight": MAIN_WEIGHT if use_subcategories else 1.0,
        "subcategory_weight": (
            SUBCATEGORY_WEIGHT if use_subcategories else 0.0
        ),
        "dislike_penalty": DISLIKE_PENALTY,
        "exploration_rate": EXPLORATION_RATE,
        "subcategory_coverage": round(coverage, 4),
        "candidate_count": candidate_count,
        "ranked_count": ranked_count,
        "method": "L2-normalized category feature vectors + cosine similarity",
        "message": (
            "ใช้หมวดหลัก 60% และหมวดรอง 40% หลัง L2 normalization"
            if use_subcategories
            else "ข้อมูลหมวดรองยังไม่ครอบคลุมเกณฑ์ จึงใช้เฉพาะหมวดหลัก"
        ),
    }


def select_next_book(
    payload: dict[str, Any],
    random_value: float | None = None,
) -> dict[str, Any]:
    likes = payload.get("likes") or []
    dislikes = payload.get("dislikes") or []
    swiped = payload.get("swiped") or []
    pool = payload.get("pool") or []
    selected_categories = payload.get("selected_categories") or []
    selected_subcategories = payload.get("selected_subcategories") or []

    use_sub, coverage = _feature_mode(pool, likes)

    # Exclude books that have already been swiped.
    swiped_ids = {
        book_key(book)
        for book in swiped
        if book_key(book)
    }

    candidate_books = [
        book
        for book in pool
        if book_key(book) and book_key(book) not in swiped_ids
    ]

    if not candidate_books:
        return {
            "book": None,
            "metadata": _metadata(pool, use_sub, coverage, 0, 0)
            | {"selection_mode": "exhausted"},
        }

    # Build the positive profile from initial preferences + Likes.
    positive_profile = preference_vector(
        likes,
        [],
        selected_categories,
        selected_subcategories,
        use_subcategories=use_sub,
    )

    # Build vectors from Disliked books.
    dislike_vectors = [
        book_vector(book, use_sub)
        for book in dislikes
    ]

    def calculate_score(
        book: dict[str, Any],
    ) -> tuple[float, float, float]:
        vector = book_vector(book, use_sub)

        positive_score = cosine_similarity(
            vector,
            positive_profile,
        )

        negative_similarity = max(
            (
                cosine_similarity(vector, disliked_vector)
                for disliked_vector in dislike_vectors
            ),
            default=0.0,
        )

        final_score = (
            positive_score
            - DISLIKE_PENALTY * negative_similarity
        )

        return final_score, positive_score, negative_similarity

    # Calculate scores for every candidate.
    scored = [
        (calculate_score(book), book)
        for book in candidate_books
    ]

    scored.sort(
        key=lambda item: (item[0][0], book_key(item[1])),
        reverse=True,
    )

    selected_main = set(_norm_labels(selected_categories))

    # Separate books into selected and outside main categories.
    if selected_main:
        primary_candidates = [
            item
            for item in scored
            if selected_main.intersection(
                _norm_labels(categories_of(item[1]))
            )
        ]

        outside_candidates = [
            item
            for item in scored
            if _outside_selected_main(
                item[1],
                selected_categories,
            )
        ]
    else:
        # If no main category was selected, use the full catalogue.
        primary_candidates = scored
        outside_candidates = []

    # If selected-category books are exhausted, use other categories.
    fallback_mode = not primary_candidates

    if fallback_mode:
        eligible_candidates = outside_candidates
    else:
        eligible_candidates = primary_candidates

    if not eligible_candidates:
        return {
            "book": None,
            "metadata": _metadata(
                pool,
                use_sub,
                coverage,
                0,
                len(scored),
            )
            | {
                "selection_mode": "exhausted",
                "message": "ไม่มีหนังสือที่ยังไม่เคยปัดเหลืออยู่",
            },
        }

    # Exploration is possible only when outside categories are available.
    exploration_available = (
        bool(swiped)
        and not fallback_mode
        and bool(outside_candidates)
    )

    random_number = (
        random.random()
        if random_value is None
        else random_value
    )

    use_exploration = (
        exploration_available
        and random_number < EXPLORATION_RATE
    )

    if use_exploration:
        # Explore outside the selected main categories.
        # Keep the highest-scoring 20% as exploration candidates.
        explore_count = max(
            1,
            math.ceil(len(outside_candidates) * 0.20),
        )

        exploration_candidates = outside_candidates[:explore_count]

        selected_feedback, selected_book = random.choice(
            exploration_candidates
        )

        source = "exploration"
        reason = (
            "สำรวจหมวดหลักอื่นนอกเหนือจากหมวดที่เลือก "
            "โดยพิจารณาความสนใจและหักคะแนนจากคุณลักษณะ "
            "ที่คล้ายหนังสือที่เคยกดไม่ชอบ"
        )

    else:
        selected_feedback, selected_book = eligible_candidates[0]

        if fallback_mode:
            source = "fallback"
            reason = (
                "ไม่มีหนังสือที่ยังไม่เคยปัดในหมวดหลักที่เลือก "
                "จึงแนะนำหนังสือจากหมวดหลักอื่น"
            )
        else:
            source = "exploitation"
            reason = (
                "เลือกหนังสือคะแนนสูงสุดภายในหมวดหลักที่เลือก "
                "โดยพิจารณาความสนใจและหักคะแนน Dislike"
            )

    final_score, positive_score, negative_similarity = selected_feedback

    result_book = dict(selected_book)
    result_book.update({
        "score": round(final_score, 6),
        "positiveScore": round(positive_score, 6),
        "dislikeSimilarity": round(negative_similarity, 6),
        "recommendationReason": reason,
        "recommendationSource": source,
    })

    return {
        "book": result_book,
        "metadata": _metadata(
            pool,
            use_sub,
            coverage,
            len(eligible_candidates),
            len(scored),
        )
        | {
            "selection_mode": source,
            "selected_score": round(final_score, 6),
            "positive_score": round(positive_score, 6),
            "dislike_similarity": round(negative_similarity, 6),
            "exploration_available": exploration_available,
            "outside_candidate_count": len(outside_candidates),
            "primary_candidate_count": len(primary_candidates),
            "dislike_count": len(dislikes),
            "selected_main_categories": selected_categories,
            "fallback_mode": fallback_mode,
        },
    }


def rank_liked_books(payload: dict[str, Any]) -> dict[str, Any]:
    likes = payload.get("likes") or []
    dislikes = payload.get("dislikes") or []
    pool = payload.get("pool") or []
    selected_categories = payload.get("selected_categories") or []
    selected_subcategories = payload.get("selected_subcategories") or []

    use_sub, coverage = _feature_mode(pool, likes)

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
            )
            | {
                "result_source": "liked_books_only",
                "message": "ยังไม่มีหนังสือที่กดใจ",
            },
        }

    ranked: list[dict[str, Any]] = []

    for index, book in enumerate(likes):
        # Leave-one-out relevance: rank each liked book against the initial
        # profile, the other liked books, and all disliked feedback.
        other_likes = [
            item
            for other_index, item in enumerate(likes)
            if other_index != index
        ]

        profile = preference_vector(
            other_likes,
            dislikes,
            selected_categories,
            selected_subcategories,
            use_subcategories=use_sub,
        )

        score = cosine_similarity(
            book_vector(book, use_sub),
            profile,
        )

        # With no other signals (e.g. a single liked book and no seed
        # categories), retain it rather than score it out.
        if len(likes) == 1 and not profile:
            score = 1.0

        item = dict(book)
        item.update({
            "score": round(score, 6),
            "recommendationReason": (
                "จัดอันดับจากความสอดคล้องกับโปรไฟล์ความสนใจ "
                "และหนังสือที่กดใจอื่น"
            ),
            "recommendationSource": "liked_book_rank",
        })

        ranked.append(item)

    ranked.sort(
        key=lambda book: (book.get("score", 0.0), book_key(book)),
        reverse=True,
    )

    top_three = ranked[:3]

    discovery_books = [
        book
        for book in ranked
        if _outside_selected_main(book, selected_categories)
    ]

    metadata = _metadata(
        pool,
        use_sub,
        coverage,
        len(pool),
        len(top_three),
    ) | {
        "result_source": "liked_books_only",
        "liked_count": len(likes),
        "discovery_liked_count": len(discovery_books),
        "top_three_source": "user_liked_books",
        "message": (
            "TOP 3 มาจากหนังสือที่ผู้ใช้กดใจจริง; "
            "หมวดใหม่แสดงจากหนังสือที่กดใจและอยู่นอกหมวดหลักที่เลือก"
        ),
    }

    return {
        "recommendations": top_three,
        "discovery": discovery_books[0] if discovery_books else None,
        "discovery_books": discovery_books,
        "metadata": metadata,
    }
