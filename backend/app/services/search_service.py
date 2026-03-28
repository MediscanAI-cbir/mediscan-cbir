from __future__ import annotations

from pathlib import Path
from tempfile import NamedTemporaryFile
from threading import Lock

from PIL import Image, UnidentifiedImageError
from pymongo import MongoClient

# Import des configurations globales
from backend.app.config import (
    MONGO_URI, 
    DB_NAME, 
    COLLECTION_NAME, 
    ALLOWED_CONTENT_TYPES, 
    ALLOWED_MODES, 
    MAX_K
)
# Import des ressources de recherche mediscan
from mediscan.search import SearchResources, load_resources, query


class SearchUnavailableError(RuntimeError):
    """Raised when a requested retrieval mode is not available at runtime."""


class SearchService:
    """Validates user input and delegates to the mediscan search pipeline."""

    def __init__(self, resources: dict[str, SearchResources]) -> None:
        self._resources = resources
        self._resources_lock = Lock()
        
        # Initialisation du client MongoDB pour l'enrichissement des données
        self._client = MongoClient(MONGO_URI)
        self._db = self._client[DB_NAME]
        self._collection = self._db[COLLECTION_NAME]

    @staticmethod
    def _normalize_mode(mode: str) -> str:
        """Nettoie et valide le mode de recherche."""
        normalized_mode = mode.strip().lower()
        if normalized_mode not in ALLOWED_MODES:
            raise ValueError(f"Unsupported mode: {mode}")
        return normalized_mode

    @staticmethod
    def _validate_k(k: int) -> None:
        """Valide le nombre de résultats demandés."""
        if not 0 < k <= MAX_K:
            raise ValueError(f"k must be between 1 and {MAX_K}")

    @staticmethod
    def _validate_content_type(content_type: str | None) -> None:
        """Vérifie que le format de fichier est supporté."""
        if content_type and content_type not in ALLOWED_CONTENT_TYPES:
            raise ValueError("Only JPEG and PNG images are accepted")

    @staticmethod
    def _validate_image_bytes(image_bytes: bytes) -> None:
        """Vérifie que l'image n'est pas vide."""
        if not image_bytes:
            raise ValueError("Uploaded image is empty")

    @staticmethod
    def _pick_suffix(filename: str) -> str:
        """Détermine l'extension du fichier temporaire."""
        suffix = Path(filename or "query.png").suffix.lower()
        return suffix if suffix in {".jpg", ".jpeg", ".png"} else ".png"

    @staticmethod
    def _verify_image(temp_path: Path) -> None:
        """Vérifie l'intégrité du fichier image avec PIL."""
        try:
            with Image.open(temp_path) as image:
                image.verify()
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("Invalid image file") from exc

    def _get_resources(self, mode: str) -> SearchResources:
        """Récupère ou charge les ressources nécessaires pour un mode donné."""
        resources = self._resources.get(mode)
        if resources is not None:
            return resources

        with self._resources_lock:
            # Double check après acquisition du lock
            resources = self._resources.get(mode)
            if resources is not None:
                return resources

            try:
                resources = load_resources(mode=mode)
            except Exception as exc:
                raise SearchUnavailableError(
                    f"Search mode '{mode}' is unavailable on this instance. "
                    "Install the required data/artifacts or rebuild the stable indexes."
                ) from exc

            self._resources[mode] = resources
            return resources

    def search(
        self,
        *,
        image_bytes: bytes,
        filename: str,
        content_type: str | None,
        mode: str = "visual",
        k: int = 5,
    ) -> dict:
        """Exécute la recherche IA et enrichit les résultats avec MongoDB."""
        
        # 1. Validations initiales
        normalized_mode = self._normalize_mode(mode)
        self._validate_k(k)
        self._validate_content_type(content_type)
        self._validate_image_bytes(image_bytes)

        temp_path: Path | None = None
        try:
            # 2. Création d'un fichier temporaire pour le moteur de recherche
            with NamedTemporaryFile(delete=False, suffix=self._pick_suffix(filename)) as handle:
                handle.write(image_bytes)
                temp_path = Path(handle.name)

            self._verify_image(temp_path)
            resources = self._get_resources(normalized_mode)
            
            # 3. APPEL À TON MOTEUR DE RECHERCHE IA
            raw_results = query(resources=resources, image=temp_path, k=k)
            
            # 4. ENRICHISSEMENT AVEC MONGODB
            enriched_results = []
            for res in raw_results:
                # On cherche les métadonnées dans MongoDB via l'image_id
                db_info = self._collection.find_one({"image_id": res["image_id"]})
                
                if db_info:
                    # On fusionne le score de l'IA avec les infos de la base
                    enriched_results.append({
                        "image_id": res["image_id"],
                        "score": float(res.get("score", 0)), # Conversion float pour JSON
                        "caption": db_info.get("caption", ""),
                        "cui": db_info.get("cui", []),
                        "file_name": db_info.get("file_name", ""),
                        "path": ""  # Initialisé à vide, sera rempli par les routes API
                    })
                else:
                    # Si pas trouvé dans Mongo, on garde le résultat brut avec la clé path vide
                    res["path"] = ""
                    enriched_results.append(res)

            # 5. Construction de la réponse finale
            return {
                "mode": normalized_mode,
                "embedder": resources.embedder.name,
                "query_image": filename,
                "results": enriched_results, # Résultats enrichis avec légendes
            }
            
        finally:
            # 6. Nettoyage systématique du fichier temporaire
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)