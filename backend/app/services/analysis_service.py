from __future__ import annotations

from groq import Groq

from backend.app.config import GROQ_API_KEY, GROQ_MODEL, MAX_CONCLUSION_RESULTS


class ClinicalConclusionError(RuntimeError):
    """Raised when the optional LLM summarization service cannot be used."""


def _prepare_ranked_captions(search_result: dict) -> tuple[str, int]:
    results = search_result.get("results", [])
    ranked_captions: list[str] = []

    for result in results[:MAX_CONCLUSION_RESULTS]:
        caption = str(result.get("caption", "")).strip()
        if not caption:
            continue

        similarity_pct = round(float(result.get("score", 0)) * 100, 1)
        ranked_captions.append(f"- Similarite {similarity_pct}% : {caption}")

    if not ranked_captions:
        raise ValueError("Impossible de generer une synthese sans descriptions exploitables.")

    return "\n".join(ranked_captions), len(ranked_captions)


def _build_messages(search_result: dict) -> list[dict[str, str]]:
    ranked_captions, caption_count = _prepare_ranked_captions(search_result)
    mode = str(search_result.get("mode", "inconnu")).strip() or "inconnu"

    return [
        {
            "role": "system",
            "content": (
                "Tu aides un prototype universitaire non clinique de recherche d'images medicales. "
                "Tu rediges une synthese prudente et concise en francais a partir de descriptions similaires. "
                "Tu ne poses jamais de diagnostic, tu ne proposes jamais de traitement, "
                "et tu rappelles toujours que la sortie ne remplace pas l'avis d'un professionnel de sante. "
                "Tu ne mentionnes pas CBIR, FAISS, embeddings ou l'infrastructure technique. "
                "Pas de tableau. Pas de HTML. Pas de listes interminables."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Mode de recherche : {mode}\n"
                f"Nombre de descriptions retenues : {caption_count}\n\n"
                "Descriptions d'images similaires, triees par similarite decroissante :\n"
                f"{ranked_captions}\n\n"
                "Redige une synthese en 3 courts paragraphes :\n"
                "1. Observations communes retrouvees dans les descriptions les plus proches.\n"
                "2. Points de prudence et limites : variabilite des resultats, manque de contexte clinique, ambiguite possible.\n"
                "3. Rappel explicite qu'il s'agit d'un resume exploratoire non clinique et non d'un diagnostic.\n"
                "Style sobre, comprehensible et factuel."
            ),
        },
    ]


def generate_clinical_conclusion(search_result: dict) -> str:
    if not GROQ_API_KEY:
        raise ClinicalConclusionError(
            "La fonctionnalite d'analyse IA n'est pas configuree sur cette instance."
        )

    try:
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=_build_messages(search_result),
            temperature=0.2,
            max_tokens=500,
        )
    except ValueError:
        raise
    except Exception as exc:
        raise ClinicalConclusionError(
            "Le service d'analyse IA est temporairement indisponible."
        ) from exc

    conclusion = (response.choices[0].message.content or "").strip()
    if not conclusion:
        raise ClinicalConclusionError("Le service d'analyse IA a retourne une reponse vide.")

    return conclusion
