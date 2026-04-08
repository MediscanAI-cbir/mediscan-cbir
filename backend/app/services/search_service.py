from __future__ import annotations

from pathlib import Path
from tempfile import NamedTemporaryFile
from threading import Lock
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, UnidentifiedImageError

from backend.app.config import ALLOWED_CONTENT_TYPES, ALLOWED_MODES, MAX_K, MONGO_URI, DB_NAME, COLLECTION_NAME
from mediscan.search import SearchResources, load_resources, query, query_text


class SearchUnavailableError(RuntimeError):
    """Raised when a requested retrieval mode is not available at runtime."""


class SearchService:
    """Validates user input and delegates to the mediscan search pipeline."""

    def __init__(self, resources: dict[str, SearchResources]) -> None:
        self._resources = resources
        self._resources_lock = Lock()

        self._mongo_collection = None
        if MONGO_URI:
            try:
                from pymongo import MongoClient
                self._mongo_collection = MongoClient(MONGO_URI)[DB_NAME][COLLECTION_NAME]
            except Exception:
                pass

    @staticmethod
    def _normalize_mode(mode: str) -> str:
        normalized_mode = mode.strip().lower()
        if normalized_mode not in ALLOWED_MODES:
            raise ValueError(f"Unsupported mode: {mode}")
        return normalized_mode

    @staticmethod
    def _validate_k(k: int) -> None:
        if not 0 < k <= MAX_K:
            raise ValueError(f"k must be between 1 and {MAX_K}")

    @staticmethod
    def _validate_content_type(content_type: str | None) -> None:
        if content_type and content_type not in ALLOWED_CONTENT_TYPES:
            raise ValueError("Only JPEG and PNG images are accepted")

    @staticmethod
    def _validate_image_bytes(image_bytes: bytes) -> None:
        if not image_bytes:
            raise ValueError("Uploaded image is empty")

    @staticmethod
    def _pick_suffix(filename: str) -> str:
        suffix = Path(filename or "query.png").suffix.lower()
        return suffix if suffix in {".jpg", ".jpeg", ".png"} else ".png"

    @staticmethod
    def _verify_image(temp_path: Path) -> None:
        try:
            with Image.open(temp_path) as image:
                image.verify()
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("Invalid image file") from exc

    def _get_resources(self, mode: str) -> SearchResources:
        resources = self._resources.get(mode)
        if resources is not None:
            return resources

        with self._resources_lock:
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

    def _enrich_with_mongo(self, results: list[dict]) -> list[dict]:
        """Optionally enrich results with MongoDB metadata. Falls back to raw results."""
        if self._mongo_collection is None:
            return results

        enriched = []
        for res in results:
            try:
                db_info = self._mongo_collection.find_one({"image_id": res["image_id"]})
            except Exception:
                return results

            if db_info:
                enriched.append({
                    "rank":     res.get("rank", 0),
                    "image_id": res["image_id"],
                    "score":    float(res.get("score", 0)),
                    "caption":  db_info.get("caption", res.get("caption", "")),
                    "cui":      db_info.get("cui", res.get("cui", "")),
                    "path":     db_info.get("file_name", res.get("path", "")),
                    "modalite": db_info.get("modalite"),
                    "organe":   db_info.get("organe"),
                    "mo":       db_info.get("mo"),
                })
            else:
                enriched.append(res)
        return enriched

    def search(
        self,
        *,
        image_bytes: bytes,
        filename: str,
        content_type: str | None,
        mode: str = "visual",
        k: int = 5,
    ) -> dict:
        normalized_mode = self._normalize_mode(mode)
        self._validate_k(k)
        self._validate_content_type(content_type)
        self._validate_image_bytes(image_bytes)

        temp_path: Path | None = None
        try:
            with NamedTemporaryFile(delete=False, suffix=self._pick_suffix(filename)) as handle:
                handle.write(image_bytes)
                temp_path = Path(handle.name)

            self._verify_image(temp_path)
            resources = self._get_resources(normalized_mode)
            results = query(resources=resources, image=temp_path, k=k)
            return {
                "mode":        normalized_mode,
                "embedder":    resources.embedder.name,
                "query_image": filename,
                "results":     self._enrich_with_mongo(results),
            }
        finally:
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)

    def search_text(self, *, text: str, k: int) -> dict:
        """Text-to-image search using BioMedCLIP semantic index."""
        text = text.strip()
        if not text:
            raise ValueError("Query text is empty")
        if len(text) > 500:
            raise ValueError("Query text too long (max 500 characters)")
        self._validate_k(k)

        resources = self._get_resources("semantic")
        results = query_text(resources=resources, text=text, k=k)
        return {
            "mode":       "semantic",
            "embedder":   resources.embedder.name,
            "query_text": text,
            "results":    self._enrich_with_mongo(results),
        }

    def search_by_id(
        self,
        *,
        image_id: str,
        mode: str = "visual",
        k: int = 5,
    ) -> dict:
        """Relance une recherche depuis un image_id existant."""
        normalized_mode = self._normalize_mode(mode)
        self._validate_k(k)

        num_str = image_id.split("_")[-1]
        folder_idx = (int(num_str) - 1) // 1000 + 1
        folder_name = f"images_{folder_idx:02d}"
        from backend.app.config import HF_BASE_URL
        url = f"{HF_BASE_URL}/{folder_name}/{image_id}.png"

        temp_path: Path | None = None
        try:
            with NamedTemporaryFile(delete=False, suffix=".png") as handle:
                temp_path = Path(handle.name)
            urllib.request.urlretrieve(url, temp_path)
            self._verify_image(temp_path)
            resources = self._get_resources(normalized_mode)
            results = query(resources=resources, image=temp_path, k=k, exclude_self=True)
            return {
                "mode":           normalized_mode,
                "embedder":       resources.embedder.name,
                "query_image_id": image_id,
                "results":        self._enrich_with_mongo(results),
            }
        finally:
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)

    def search_by_ids(
        self,
        *,
        image_ids: list[str],
        mode: str = "visual",
        k: int = 5,
    ) -> dict:
        """Recherche par centroide — moyenne des embeddings de plusieurs images."""
        if not image_ids:
            raise ValueError("La liste d'image_ids est vide")
        if len(image_ids) > 20:
            raise ValueError("Maximum 20 images selectionnables")

        normalized_mode = self._normalize_mode(mode)
        self._validate_k(k)

        resources = self._get_resources(normalized_mode)
        embedder = resources.embedder

        from backend.app.config import HF_BASE_URL
        import numpy as np
        import faiss as faiss_lib

        def download_and_encode(image_id: str):
            num_str = image_id.split("_")[-1]
            folder_idx = (int(num_str) - 1) // 1000 + 1
            folder_name = f"images_{folder_idx:02d}"
            url = f"{HF_BASE_URL}/{folder_name}/{image_id}.png"

            temp_path: Path | None = None
            try:
                with NamedTemporaryFile(delete=False, suffix=".png") as handle:
                    temp_path = Path(handle.name)
                urllib.request.urlretrieve(url, temp_path)
                self._verify_image(temp_path)
                with Image.open(temp_path) as pil_image:
                    return embedder.encode_pil(pil_image)
            finally:
                if temp_path is not None:
                    temp_path.unlink(missing_ok=True)

        with ThreadPoolExecutor(max_workers=len(image_ids)) as executor:
            embeddings = list(executor.map(download_and_encode, image_ids))

        # Agregation par max pooling (features dominantes)
        emb_matrix = np.array(embeddings, dtype=np.float32)
        centroid = np.max(emb_matrix, axis=0).reshape(1, -1).astype(np.float32)
        faiss_lib.normalize_L2(centroid)

        search_k = min(k + len(image_ids), resources.index.ntotal)
        scores, indices = resources.index.search(centroid, search_k)

        results = []
        excluded_ids = set(image_ids)
        for idx, score in zip(indices[0], scores[0]):
            if idx < 0:
                continue
            row = resources.rows[idx]
            image_id = str(row.get("image_id", ""))
            if image_id in excluded_ids:
                continue
            results.append({
                "rank":     len(results) + 1,
                "score":    float(score),
                "image_id": image_id,
                "path":     str(row.get("path", "")),
                "caption":  str(row.get("caption", "")),
                "cui":      str(row.get("cui", "")),
                "modalite": None,
                "organe":   None,
                "mo":       None,
            })
            if len(results) >= k:
                break

        return {
            "mode":            normalized_mode,
            "embedder":        embedder.name,
            "query_image_ids": image_ids,
            "results":         self._enrich_with_mongo(results),
        }