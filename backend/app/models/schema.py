from pydantic import BaseModel


class SearchResult(BaseModel):
    rank: int
    image_id: str
    score: float
    path: str
    caption: str
    cui: str


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