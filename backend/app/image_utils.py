"""
Utilitaires pour la gestion des identifiants d'images et des URLs HuggingFace.

Ce module fournit des fonctions pour valider les identifiants d'images ROCOv2,
construire les URLs publiques HuggingFace correspondantes, et transformer les
payloads de résultats pour remplacer les chemins locaux par des URLs publiques.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from backend.app.config import HF_BASE_URL


def sanitize_image_id(image_id: str) -> str:
    """
    Valide et assainit un identifiant d'image ROCOv2.

    Les identifiants valides ne contiennent que des caractères alphanumériques,
    des tirets ou des underscores, et se terminent par un suffixe numérique
    (ex: ROCOv2_2023_train_000042).

    Args:
        image_id: L'identifiant brut à valider.

    Returns:
        L'identifiant nettoyé s'il est valide.

    Raises:
        ValueError: Si l'identifiant contient des caractères non autorisés
                    ou ne se termine pas par un numéro de séquence.
    """
    safe_id = "".join(char for char in image_id if char.isalnum() or char in {"_", "-"})
    suffix = safe_id.rsplit("_", 1)[-1] if safe_id else ""

    if safe_id != image_id or not suffix.isdigit():
        raise ValueError("Invalid image ID")

    return safe_id


def image_folder_name(image_id: str) -> str:
    """
    Détermine le sous-dossier HuggingFace contenant une image ROCOv2.

    Les images sont regroupées par tranches de 1000 dans des dossiers
    nommés images_01, images_02, etc. Le numéro de dossier est calculé
    à partir du numéro de séquence présent dans l'identifiant.

    Args:
        image_id: L'identifiant de l'image (sera validé avant utilisation).

    Returns:
        Le nom du sous-dossier HuggingFace (ex: 'images_01').
    """
    safe_id = sanitize_image_id(image_id)
    image_number = int(safe_id.rsplit("_", 1)[-1])
    folder_idx = (image_number - 1) // 1000 + 1
    return f"images_{folder_idx:02d}"


def hf_image_url(image_id: str) -> str:
    """
    Construit l'URL publique HuggingFace pour une image du dataset ROCOv2.

    Args:
        image_id: L'identifiant de l'image à localiser.

    Returns:
        L'URL complète de l'image sur HuggingFace (format PNG).
    """
    safe_id = sanitize_image_id(image_id)
    return f"{HF_BASE_URL}/{image_folder_name(safe_id)}/{safe_id}.png"


def with_public_result_paths(payload: Mapping[str, Any]) -> dict[str, Any]:
    """
    Copie un payload de réponse en remplaçant les chemins locaux par des URLs HuggingFace.

    Transforme chaque résultat du payload en remplaçant le champ 'path' local
    par l'URL publique HuggingFace correspondante, afin que le frontend puisse
    afficher les images directement depuis HuggingFace.

    Args:
        payload: Le payload de réponse brut du pipeline de recherche.

    Returns:
        Une copie du payload avec les chemins remplacés par des URLs publiques.
        Les résultats dont l'image_id est invalide conservent leur chemin original.
    """
    public_payload = dict(payload)
    public_results: list[dict[str, Any]] = []

    for raw_result in payload.get("results", []):
        result = dict(raw_result)
        image_id = result.get("image_id")

        if isinstance(image_id, str):
            try:
                result["path"] = hf_image_url(image_id)
            except ValueError:
                pass

        public_results.append(result)

    public_payload["results"] = public_results
    return public_payload


__all__ = ["hf_image_url", "image_folder_name", "sanitize_image_id", "with_public_result_paths"]
