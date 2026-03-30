from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from backend.app.models.schema import SearchResponse, TextSearchResponse, IdSearchResponse
from backend.app.config import ALLOWED_MODES, HF_BASE_URL
from backend.app.models.schema import SearchResponse, TextSearchResponse
from backend.app.services.search_service import SearchUnavailableError
from backend.app.models.schema import SearchResponse, TextSearchResponse, IdSearchResponse, IdsSearchResponse

router = APIRouter()


def _get_service(request: Request):
    """Retrieve the SearchService loaded at startup."""
    return request.app.state.search_service


def _sanitize_image_id(image_id: str) -> str:
    """Allow only the stable dataset ID characters used by the project."""
    safe_id = "".join(c for c in image_id if c.isalnum() or c in ("_", "-"))
    if safe_id != image_id:
        raise HTTPException(status_code=400, detail="Invalid image ID")
    return safe_id


def _hf_image_url(image_id: str) -> str:
    """Build the HuggingFace dataset URL for a given image ID.

    Image IDs follow the pattern ROCOv2_2023_train_XXXXXX.
    Images are split into folders of 1000: images_01, images_02, ...
    """
    num_str = image_id.split("_")[-1]
    folder_idx = (int(num_str) - 1) // 1000 + 1
    folder_name = f"images_{folder_idx:02d}"
    return f"{HF_BASE_URL}/{folder_name}/{image_id}.png"


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/search", response_model=SearchResponse)
async def search_image(
    request: Request,
    image: UploadFile = File(...),
    mode: str = Form("visual"),
    k: int = Form(5),
) -> SearchResponse:
    service = _get_service(request)
    try:
        image_bytes = await image.read()
        payload = service.search(
            image_bytes=image_bytes,
            filename=image.filename or "query.png",
            content_type=image.content_type,
            mode=mode,
            k=k,
        )
        # Replace local paths with HuggingFace URLs
        for res in payload.get("results", []):
            try:
                res["path"] = _hf_image_url(_sanitize_image_id(res["image_id"]))
            except Exception:
                pass
        return SearchResponse(**payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SearchUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


class TextSearchRequest(BaseModel):
    text: str
    k: int = 5


@router.post("/search-text", response_model=TextSearchResponse)
async def search_text(body: TextSearchRequest, request: Request) -> TextSearchResponse:
    """Text-to-image search using BioMedCLIP semantic index."""
    service = _get_service(request)
    try:
        payload = service.search_text(text=body.text, k=body.k)
        # Replace local paths with HuggingFace URLs
        for res in payload.get("results", []):
            try:
                res["path"] = _hf_image_url(_sanitize_image_id(res["image_id"]))
            except Exception:
                pass
        return TextSearchResponse(**payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SearchUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/images/{image_id}")
async def get_image(image_id: str) -> RedirectResponse:
    """Redirect to the HuggingFace dataset image."""
    safe_id = _sanitize_image_id(image_id)
    return RedirectResponse(url=_hf_image_url(safe_id))


class IdSearchRequest(BaseModel):
    image_id: str
    mode: str = "visual"
    k: int = 5


@router.post("/search-by-id", response_model=IdSearchResponse)
async def search_by_id(body: IdSearchRequest, request: Request) -> IdSearchResponse:
    """Relance une recherche depuis un image_id existant."""
    service = _get_service(request)
    try:
        safe_id = _sanitize_image_id(body.image_id)
        payload = service.search_by_id(
            image_id=safe_id,
            mode=body.mode,
            k=body.k,
        )
        for res in payload.get("results", []):
            try:
                res["path"] = _hf_image_url(_sanitize_image_id(res["image_id"]))
            except Exception:
                pass
        return IdSearchResponse(**payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SearchUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    


class IdsSearchRequest(BaseModel):
    image_ids: list[str]
    mode: str = "visual"
    k: int = 5


@router.post("/search-by-ids", response_model=IdsSearchResponse)
async def search_by_ids(body: IdsSearchRequest, request: Request) -> IdsSearchResponse:
    """Recherche par centroide depuis plusieurs image_ids selectionnes."""
    service = _get_service(request)
    try:
        safe_ids = [_sanitize_image_id(iid) for iid in body.image_ids]
        payload = service.search_by_ids(
            image_ids=safe_ids,
            mode=body.mode,
            k=body.k,
        )
        for res in payload.get("results", []):
            try:
                res["path"] = _hf_image_url(_sanitize_image_id(res["image_id"]))
            except Exception:
                pass
        return IdsSearchResponse(**payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SearchUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc