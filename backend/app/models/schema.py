from pydantic import BaseModel

class SearchResult(BaseModel):
    image_id: str
    score: float
    rank: int | None = None 
    path: str | None = None 
    caption: str = ""
    cui: list = [] 

class SearchResponse(BaseModel):
    mode: str
    embedder: str
    query_image: str
    results: list[SearchResult]