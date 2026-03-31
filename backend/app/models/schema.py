from typing import Union
from pydantic import BaseModel, field_validator


class SearchResult(BaseModel):
    rank: int
    image_id: str
    score: float
    path: str
    caption: str
    cui: Union[str, list]

    @field_validator("cui", mode="before")
    @classmethod
    def coerce_cui(cls, v):
        if isinstance(v, list):
            return v[0] if v else ""
        return v


class SearchResponse(BaseModel):
    mode: str
    embedder: str
    query_image: str
    results: list[SearchResult]


class TextSearchResponse(BaseModel):
    mode: str
    embedder: str
    query_text: str
    results: list[SearchResult]


class IdSearchResponse(BaseModel):
    mode: str
    embedder: str
    query_image_id: str
    results: list[SearchResult]


class IdsSearchResponse(BaseModel):
    mode: str
    embedder: str
    query_image_ids: list[str]
    results: list[SearchResult]