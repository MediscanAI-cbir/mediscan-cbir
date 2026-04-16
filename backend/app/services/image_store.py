"""
Gestion du stockage temporaire et du téléchargement des images pour le pipeline de recherche.

Ce module fournit des utilitaires pour :
- Vérifier l'intégrité des fichiers image (format valide, non corrompu)
- Gérer des fichiers temporaires supprimés automatiquement après usage
- Télécharger des images depuis HuggingFace pour les recherches par ID
- Calculer un embedding centroïde à partir d'une sélection d'images (max-pooling)
"""

from __future__ import annotations

from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from functools import partial
from pathlib import Path
from shutil import copyfileobj
from tempfile import NamedTemporaryFile
from urllib.error import URLError
from urllib.request import urlopen

import numpy as np
from PIL import Image, UnidentifiedImageError

from backend.app.config import REMOTE_IMAGE_TIMEOUT_SECONDS
from backend.app.image_utils import hf_image_url

MAX_DOWNLOAD_WORKERS = 8


def verify_image(temp_path: Path) -> None:
    """
    Vérifie qu'un fichier image temporaire est valide et non corrompu.

    Args:
        temp_path: Le chemin vers le fichier image temporaire à vérifier.

    Raises:
        ValueError: Si le fichier n'est pas une image valide ou est corrompu.
    """
    try:
        with Image.open(temp_path) as image:
            image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("Invalid image file") from exc


@contextmanager
def temporary_image_path(*, suffix: str) -> Iterator[Path]:
    """
    Gestionnaire de contexte qui crée un fichier temporaire et le supprime à la sortie.

    Args:
        suffix: L'extension du fichier temporaire (ex: '.png', '.jpg').

    Yields:
        Le chemin vers le fichier temporaire créé.
    """
    with NamedTemporaryFile(delete=False, suffix=suffix) as handle:
        temp_path = Path(handle.name)

    try:
        yield temp_path
    finally:
        temp_path.unlink(missing_ok=True)


@contextmanager
def downloaded_image(image_id: str) -> Iterator[Path]:
    """
    Gestionnaire de contexte qui télécharge une image depuis HuggingFace dans un fichier temporaire.

    Télécharge l'image identifiée par image_id depuis le dataset ROCOv2 hébergé sur
    HuggingFace, la stocke dans un fichier temporaire, vérifie son intégrité,
    puis supprime le fichier à la sortie du contexte.

    Args:
        image_id: L'identifiant ROCOv2 de l'image à télécharger.

    Yields:
        Le chemin vers le fichier image temporaire téléchargé et vérifié.

    Raises:
        RuntimeError: Si le téléchargement échoue (réseau indisponible, image introuvable).
        ValueError: Si le fichier téléchargé n'est pas une image valide.
    """
    with temporary_image_path(suffix=".png") as temp_path:
        try:
            with urlopen(
                hf_image_url(image_id),
                timeout=REMOTE_IMAGE_TIMEOUT_SECONDS,
            ) as response, temp_path.open("wb") as handle:
                copyfileobj(response, handle)
        except (OSError, URLError) as exc:
            raise RuntimeError(f"Unable to download image '{image_id}'.") from exc

        verify_image(temp_path)
        yield temp_path


def encode_remote_image(image_id: str, embedder) -> object:
    """
    Télécharge une image distante et calcule son embedding via l'encodeur fourni.

    Args:
        image_id: L'identifiant ROCOv2 de l'image à encoder.
        embedder: L'instance d'embedder (DinoV2 ou BioMedCLIP) à utiliser.

    Returns:
        Le vecteur d'embedding calculé pour l'image.
    """
    with downloaded_image(image_id) as temp_path:
        with Image.open(temp_path) as pil_image:
            return embedder.encode_pil(pil_image)


def build_centroid_embedding(
    *,
    image_ids: list[str],
    embedder,
    max_download_workers: int = MAX_DOWNLOAD_WORKERS,
) -> np.ndarray:
    """
    Calcule un embedding centroïde à partir d'une sélection d'images (max-pooling).

    Télécharge et encode toutes les images en parallèle, puis combine les embeddings
    obtenus en prenant le maximum élément par élément (max-pooling). Cette approche
    produit un vecteur requête représentatif de l'ensemble de la sélection.

    Args:
        image_ids: Liste des identifiants ROCOv2 des images sélectionnées.
        embedder: L'instance d'embedder à utiliser pour l'encodage.
        max_download_workers: Nombre maximum de threads parallèles pour le téléchargement.

    Returns:
        Un tableau numpy de forme (1, embedding_dim) représentant le centroïde.
    """
    worker_count = max(1, min(len(image_ids), max_download_workers))
    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        embeddings = list(executor.map(partial(encode_remote_image, embedder=embedder), image_ids))

    return np.max(np.stack(embeddings, axis=0), axis=0).reshape(1, -1).astype(np.float32)
