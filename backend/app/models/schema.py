from email.utils import parseaddr
from typing import Union
from pydantic import BaseModel, Field, field_validator


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


class SearchResponseBase(BaseModel):
    mode: str
    embedder: str
    results: list[SearchResult]


class SearchResponse(SearchResponseBase):
    query_image: str


class TextSearchResponse(SearchResponseBase):
    query_text: str


class IdSearchResponse(SearchResponseBase):
    query_image_id: str


class IdsSearchResponse(SearchResponseBase):
    query_image_ids: list[str]


class ConclusionSearchResult(BaseModel):
    rank: int = Field(ge=1)
    image_id: str = ""
    score: float
    caption: str = ""


class ConclusionRequest(BaseModel):
    mode: str | None = None
    embedder: str | None = None
    results: list[ConclusionSearchResult] = Field(min_length=1, max_length=20)


class ConclusionResponse(BaseModel):
    conclusion: str


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=320)
    subject: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("name", "subject", "message")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        text = value.strip()
        if not text:
            raise ValueError("Field cannot be empty.")
        return text

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip()
        parsed_name, parsed_email = parseaddr(email)
        if parsed_name or not parsed_email or "@" not in parsed_email:
            raise ValueError("Invalid email address.")
        local_part, _, domain = parsed_email.partition("@")
        if not local_part or "." not in domain:
            raise ValueError("Invalid email address.")
        return parsed_email


class ContactResponse(BaseModel):
    success: bool
    message: str
