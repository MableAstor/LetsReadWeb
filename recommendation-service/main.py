from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from engine import ENGINE_VERSION, rank_liked_books, select_next_book

app = FastAPI(
    title="Let's Read Recommendation API",
    description="Content-based recommendations that update after each like/dislike.",
    version="2.0.0",
)

_DEFAULT_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
_EXTRA_ORIGINS = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()]
_FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip()
_origins = list(dict.fromkeys(_DEFAULT_ORIGINS + _EXTRA_ORIGINS + ([_FRONTEND_URL] if _FRONTEND_URL else [])))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class RecommendationPayload(BaseModel):
    likes: list[dict[str, Any]] = Field(default_factory=list)
    dislikes: list[dict[str, Any]] = Field(default_factory=list)
    swiped: list[dict[str, Any]] = Field(default_factory=list)
    pool: list[dict[str, Any]] = Field(default_factory=list)
    selected_categories: list[str] = Field(default_factory=list)
    selected_subcategories: list[str] = Field(default_factory=list)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Let's Read Recommendation API is running", "engine": ENGINE_VERSION}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": "python-cbf", "version": ENGINE_VERSION}


@app.post("/next-book")
def next_book(payload: RecommendationPayload) -> dict[str, Any]:
    """Pick the next unseen book using all feedback collected so far."""
    return select_next_book(payload.model_dump())


@app.post("/recommend")
def recommend(payload: RecommendationPayload) -> dict[str, Any]:
    """At the end of a session, rank only user-liked books for the TOP 3."""
    return rank_liked_books(payload.model_dump())
