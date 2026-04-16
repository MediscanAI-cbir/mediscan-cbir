"""
Fonctions de validation des entrées utilisateur pour le pipeline de recherche Mediscan.

Ce module centralise toutes les vérifications de paramètres (mode, k, type de fichier,
texte de requête, identifiants d'images) afin de garantir la robustesse de l'API
avant tout appel au pipeline CBIR ou aux index FAISS.
"""

from __future__ import annotations

from pathlib import Path

from backend.app.config import ALLOWED_CONTENT_TYPES, ALLOWED_MODES, MAX_K, MAX_UPLOAD_BYTES
from backend.app.image_utils import sanitize_image_id

MAX_TEXT_QUERY_LENGTH = 500
MAX_SELECTION_SIZE = 20
ALLOWED_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}


def normalize_mode(mode: str) -> str:
    """
    Vérifie que le mode de recherche choisi est supporté et le normalise.

    Args:
        mode: Le mode de recherche brut ('visual' ou 'semantic').

    Returns:
        Le mode normalisé en minuscules sans espaces.

    Raises:
        ValueError: Si le mode n'est pas dans ALLOWED_MODES.
    """
    normalized_mode = mode.strip().lower()
    if normalized_mode not in ALLOWED_MODES:
        raise ValueError(f"Unsupported mode: {mode}")
    return normalized_mode


def validate_k(k: int) -> None:
    """
    Vérifie que le nombre de résultats demandés k est dans les limites autorisées.

    Args:
        k: Le nombre de résultats voulus.

    Raises:
        ValueError: Si k est inférieur à 1 ou supérieur à MAX_K.
    """
    if not 0 < k <= MAX_K:
        raise ValueError(f"k must be between 1 and {MAX_K}")


def validate_content_type(content_type: str | None) -> None:
    """
    Vérifie que le type MIME du fichier image est autorisé (JPEG ou PNG).

    Args:
        content_type: Le type MIME du fichier uploadé (peut être None).

    Raises:
        ValueError: Si le type MIME est fourni et non supporté.
    """
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Only JPEG and PNG images are accepted")


def validate_image_bytes(image_bytes: bytes) -> None:
    """
    Vérifie que les données binaires de l'image ne sont pas vides et ne dépassent pas la limite.

    Args:
        image_bytes: Les octets du fichier image.

    Raises:
        ValueError: Si les données sont vides ou dépassent MAX_UPLOAD_BYTES.
    """
    if not image_bytes:
        raise ValueError("Uploaded image is empty")
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        max_size_mb = MAX_UPLOAD_BYTES / (1024 * 1024)
        raise ValueError(f"Uploaded image exceeds the {max_size_mb:.0f} MB limit")


def validate_text_query(text: str) -> str:
    """
    Vérifie et normalise une requête textuelle avant de l'envoyer au pipeline sémantique.

    Args:
        text: La requête textuelle brute saisie par l'utilisateur.

    Returns:
        La requête nettoyée (espaces supprimés).

    Raises:
        ValueError: Si la requête est vide ou dépasse MAX_TEXT_QUERY_LENGTH caractères.
    """
    normalized_text = text.strip()
    if not normalized_text:
        raise ValueError("Query text is empty")
    if len(normalized_text) > MAX_TEXT_QUERY_LENGTH:
        raise ValueError(f"Query text too long (max {MAX_TEXT_QUERY_LENGTH} characters)")
    return normalized_text


def validate_selected_image_ids(image_ids: list[str]) -> list[str]:
    """
    Vérifie et assainit une liste d'identifiants d'images sélectionnés.

    Args:
        image_ids: La liste brute d'identifiants fournis par le frontend.

    Returns:
        La liste des identifiants nettoyés et validés.

    Raises:
        ValueError: Si la liste est vide ou dépasse MAX_SELECTION_SIZE éléments.
    """
    if not image_ids:
        raise ValueError("La liste d'image_ids est vide")
    if len(image_ids) > MAX_SELECTION_SIZE:
        raise ValueError(f"Maximum {MAX_SELECTION_SIZE} images selectionnables")
    return [sanitize_image_id(image_id) for image_id in image_ids]


def pick_image_suffix(filename: str) -> str:
    """
    Détermine l'extension de fichier à utiliser pour l'image temporaire.

    Args:
        filename: Le nom de fichier original uploadé.

    Returns:
        L'extension en minuscules (.jpg, .jpeg, .png) ou '.png' par défaut.
    """
    suffix = Path(filename or "query.png").suffix.lower()
    return suffix if suffix in ALLOWED_IMAGE_SUFFIXES else ".png"
