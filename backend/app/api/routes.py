import fsspec
from io import BytesIO
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse, RedirectResponse

from backend.app.config import ALLOWED_MODES 
from backend.app.models.schema import SearchResponse
from backend.app.services.search_service import SearchUnavailableError

router = APIRouter()

# --- CONFIGURATION HUGGING FACE ---
BASE_HF_URL = "https://huggingface.co/datasets/Mediscan-Team/mediscan-data/resolve/main"

def _get_service(request: Request):
    """Récupère le SearchService injecté dans l'état de l'application au démarrage."""
    return request.app.state.search_service

def _sanitize_image_id(image_id: str) -> str:
    """Nettoie l'ID de l'image pour éviter les caractères spéciaux non désirés."""
    return "".join(c for c in image_id if c.isalnum() or c in ("_", "-"))

def _calculate_hf_path(safe_id: str) -> str:
    """
    Logique centralisée pour calculer le chemin vers Hugging Face.
    Prend l'ID (ex: ROCOv2_2023_train_000001) et retourne l'URL complète du dossier images_XX.
    """
    # On extrait uniquement la dernière partie après le dernier '_' (ex: 000001)
    num_str = safe_id.split('_')[-1]
    image_num = int(num_str)
    
    # Calcul du dossier (ex: 1 à 1000 -> images_01)
    folder_idx = (image_num - 1) // 1000 + 1
    folder_name = f"images_{folder_idx:02d}"
    
    extension = ".png" if not safe_id.lower().endswith('.png') else ""
    return f"{BASE_HF_URL}/{folder_name}/{safe_id}{extension}"

@router.get("/health")
def health() -> dict[str, str]:
    """Route de vérification de l'état du serveur."""
    return {"status": "ok"}

@router.post("/search", response_model=SearchResponse)
async def search_image(
    request: Request,
    image: UploadFile = File(...),
    mode: str = Form("visual"),
    k: int = Form(5),
) -> SearchResponse:
    """
    Endpoint principal : reçoit une image, interroge le moteur de recherche,
    et enrichit les résultats avec les URLs directes vers Hugging Face.
    """
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
        
        # Transformation des IDs en URLs accessibles par le Frontend
        for res in payload.get("results", []):
            try:
                safe_id = _sanitize_image_id(res["image_id"])
                res["path"] = _calculate_hf_path(safe_id)
            except Exception as e:
                print(f"Erreur lors du calcul du chemin pour {res.get('image_id')}: {e}")
                continue 
        
        return SearchResponse(**payload)
        
    except Exception as exc:
        print(f"Erreur lors de la recherche : {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/images/{image_id}")
async def get_image(image_id: str):
    """
    Route de secours ou de redirection : redirige le client vers 
    l'emplacement réel de l'image sur Hugging Face.
    """
    safe_id = _sanitize_image_id(image_id)
    try:
        hf_url = _calculate_hf_path(safe_id)
        return RedirectResponse(url=hf_url)
    except Exception:
        raise HTTPException(status_code=404, detail="Image path could not be resolved")