from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AliasChoices, BaseModel, Field, model_validator

from engine import ENGINE_VERSION, rank_liked_books, select_next_book

app = FastAPI(title="Let's Read Recommendation API", version="3.2.2")

allowed_origins = list(dict.fromkeys(
    ["http://localhost:5173", "http://127.0.0.1:5173"]
    + [origin.strip().rstrip("/") for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()]
    + ([os.getenv("FRONTEND_URL", "").strip().rstrip("/")] if os.getenv("FRONTEND_URL", "").strip() else [])
))
app.add_middleware(
    CORSMiddleware, allow_origins=allowed_origins,
    allow_credentials=False, allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["*"],
)


class RecommendationPayload(BaseModel):
    # Canonical name is `preferences`; `user_preferences` is an accepted alias
    # for clients using the supplied v3.2 Python example. An empty array is valid.
    preferences: list[dict[str, Any]] = Field(
        validation_alias=AliasChoices("preferences", "user_preferences")
    )
    likes: list[dict[str, Any]] = Field(default_factory=list)
    swiped: list[dict[str, Any]] = Field(default_factory=list)
    pool: list[dict[str, Any]] = Field(default_factory=list)
    selected_categories: list[str] = Field(default_factory=list)
    selected_subcategories: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def require_named_preference_features(self):
        # ID-only preference rows cannot match book labels. Report a helpful
        # 422 instead of silently returning all-zero similarity scores.
        main_keys = {"category", "categories", "main_category", "main_categories",
                     "Categorise_Name", "categorise_name", "category_name",
                     "Category_Name", "CategoryName"}
        sub_keys = {"subcategory", "subcategories", "sub_category",
                    "Subcategorise_Name", "subcategorise_name", "subcategory_name",
                    "Subcategory_Name", "SubcategoryName"}
        for i, pref in enumerate(self.preferences):
            has_named = any(pref.get(k) not in (None, "", []) for k in main_keys | sub_keys)
            kind = str(pref.get("type") or pref.get("kind") or pref.get("level") or "").lower()
            has_typed_label = kind in {
                "main", "category", "categorise", "sub", "subcategory", "subcategorise"
            } and pref.get("label") not in (None, "", [])
            if not (has_named or has_typed_label):
                raise ValueError(
                    f"preferences[{i}] ไม่มีชื่อหมวด: ต้องส่ง Categorise_Name / "
                    f"Subcategorise_Name หรือ type+label; ID อย่างเดียวไม่พอ"
                )
        return self


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Let's Read Recommendation API is running", "engine": ENGINE_VERSION}


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "engine": ENGINE_VERSION,
        "preference_source": "supabase_user_preferences",
        "request_contract": "preferences-v1 (alias: user_preferences)",
        "api_version": "3.2.2",
    }


@app.post("/next-book")
def next_book(payload: RecommendationPayload) -> dict[str, Any]:
    return select_next_book(payload.model_dump())


@app.post("/recommend")
def recommend(payload: RecommendationPayload) -> dict[str, Any]:
    return rank_liked_books(payload.model_dump())
