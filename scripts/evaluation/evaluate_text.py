"""Evaluation du mode text-to-image (BioMedCLIP).

Deux approches :
    1. Caption-to-image : utilise la caption d'une image comme requete texte
       et verifie si les resultats partagent des mots cles avec cette caption.
    2. Keyword-to-image : utilise des mots cles predefined (chest, brain, lung...)
       et verifie si les captions des resultats contiennent ces mots cles.

Usage :
    python scripts/evaluation/evaluate_text.py --n-queries 200 --seed 42
    python scripts/evaluation/evaluate_text.py --n-queries 200 --seed 123 --mode keyword
    python scripts/evaluation/evaluate_text.py --n-queries 200 --seed 999 --mode both
"""

from __future__ import annotations

import argparse
import csv
import random
import re
import string
from datetime import datetime
from pathlib import Path

from mediscan.process import configure_cpu_environment
from mediscan.runtime import resolve_path
from mediscan.search import load_resources, query_text

configure_cpu_environment()

# ---------------------------------------------------------------------------
# Mots cles predefined pour le mode keyword
# ---------------------------------------------------------------------------
KEYWORDS = [
    "chest", "brain", "lung", "heart", "liver", "kidney",
    "spine", "pelvis", "abdomen", "knee", "shoulder",
    "CT", "MRI", "X-ray", "ultrasound",
    "pneumonia", "tumor", "fracture", "cancer", "infection",
]

# Mots vides a ignorer pour la comparaison
STOP_WORDS = {
    "a", "an", "the", "of", "in", "on", "at", "to", "for",
    "with", "and", "or", "is", "are", "was", "were", "be",
    "this", "that", "from", "by", "as", "it", "its", "has",
    "have", "had", "not", "no", "but", "so", "if", "into",
    "left", "right", "both", "bilateral", "showing", "shows",
    "demonstrated", "demonstrating", "revealed", "revealing",
}

# Seuils
SEUILS = {
    "caption": {
        "precision_at_k": 0.30,  # >=30% des resultats partagent des mots cles avec la caption
        "top1_hit":       0.50,  # >=50% des requetes ont au moins 1 resultat pertinent
    },
    "keyword": {
        "precision_at_k": 0.35,  # >=35% des resultats contiennent le mot cle
        "top1_hit":       0.60,  # >=60% des requetes ont au moins 1 resultat pertinent
    },
}


# ---------------------------------------------------------------------------
# Utilitaires texte
# ---------------------------------------------------------------------------

def tokenize(text: str) -> set[str]:
    """Tokenise un texte en mots significatifs (minuscules, sans ponctuation)."""
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = set(text.split())
    return tokens - STOP_WORDS


def keywords_match(query_tokens: set[str], caption: str) -> bool:
    """Verifie si la caption contient au moins un mot cle de la requete."""
    caption_tokens = tokenize(caption)
    return bool(query_tokens & caption_tokens)


def keyword_in_caption(keyword: str, caption: str) -> bool:
    """Verifie si le mot cle apparait dans la caption (insensible a la casse)."""
    return keyword.lower() in caption.lower()


# ---------------------------------------------------------------------------
# Selection des requetes
# ---------------------------------------------------------------------------

def pick_caption_rows(rows: list[dict], n: int, seed: int) -> list[dict]:
    """Selectionne des images avec une caption non vide."""
    evaluable = [r for r in rows if r.get("caption", "").strip()]
    if n > len(evaluable):
        print(f"[WARN] Demande {n} requetes mais seulement {len(evaluable)} disponibles.")
        n = len(evaluable)
    return random.Random(seed).sample(evaluable, n)


def pick_keywords(n: int, seed: int) -> list[str]:
    """Selectionne des mots cles aleatoirement."""
    rng = random.Random(seed)
    return [rng.choice(KEYWORDS) for _ in range(n)]


# ---------------------------------------------------------------------------
# Evaluation mode caption-to-image
# ---------------------------------------------------------------------------

def evaluate_caption(
    query_rows: list[dict],
    resources,
    k: int,
) -> tuple[list[dict], list[dict]]:
    """Evalue le mode text-to-image en utilisant les captions comme requetes."""
    query_results: list[dict] = []
    result_details: list[dict] = []

    for i, query_row in enumerate(query_rows, start=1):
        caption_query = query_row.get("caption", "").strip()
        if not caption_query:
            continue

        query_tokens = tokenize(caption_query)
        if not query_tokens:
            continue

        results = query_text(resources=resources, text=caption_query, k=k)

        hits = []
        for result in results:
            caption_result = result.get("caption", "")
            match = keywords_match(query_tokens, caption_result)
            hits.append(1 if match else 0)

            result_details.append({
                "query_id":      query_row["image_id"],
                "query_caption": caption_query[:80],
                "result_id":     result["image_id"],
                "score_faiss":   result["score"],
                "match":         int(match),
            })

        precision = sum(hits) / len(hits) if hits else 0.0
        top1_hit  = int(any(hits))

        query_results.append({
            "query_id":      query_row["image_id"],
            "caption":       caption_query[:80],
            "precision_at_k": precision,
            "top1_hit":      top1_hit,
            "n_results":     len(results),
        })

        if i % 20 == 0:
            print(f"  [caption] Evalue {i}/{len(query_rows)} requetes...")

    return query_results, result_details


# ---------------------------------------------------------------------------
# Evaluation mode keyword-to-image
# ---------------------------------------------------------------------------

def evaluate_keyword(
    keywords: list[str],
    resources,
    k: int,
) -> tuple[list[dict], list[dict]]:
    """Evalue le mode text-to-image en utilisant des mots cles predefined."""
    query_results: list[dict] = []
    result_details: list[dict] = []

    for i, keyword in enumerate(keywords, start=1):
        results = query_text(resources=resources, text=keyword, k=k)

        hits = []
        for result in results:
            caption_result = result.get("caption", "")
            match = keyword_in_caption(keyword, caption_result)
            hits.append(1 if match else 0)

            result_details.append({
                "keyword":     keyword,
                "result_id":   result["image_id"],
                "score_faiss": result["score"],
                "caption":     caption_result[:80],
                "match":       int(match),
            })

        precision = sum(hits) / len(hits) if hits else 0.0
        top1_hit  = int(any(hits))

        query_results.append({
            "keyword":        keyword,
            "precision_at_k": precision,
            "top1_hit":       top1_hit,
            "n_results":      len(results),
        })

        if i % 20 == 0:
            print(f"  [keyword] Evalue {i}/{len(keywords)} requetes...")

    return query_results, result_details


# ---------------------------------------------------------------------------
# Calcul des metriques
# ---------------------------------------------------------------------------

def compute_metrics(
    query_results: list[dict],
    mode: str,
) -> dict[str, float]:
    total = len(query_results)
    if total == 0:
        return {}

    precision_at_k = sum(r["precision_at_k"] for r in query_results) / total
    top1_hit       = sum(r["top1_hit"] for r in query_results) / total

    return {
        "precision_at_k": precision_at_k,
        "top1_hit":       top1_hit,
        "n_queries":      total,
    }


# ---------------------------------------------------------------------------
# Affichage
# ---------------------------------------------------------------------------

def print_results(metrics: dict, mode: str, k: int, seed: int) -> None:
    seuils = SEUILS[mode]

    print(f"\n{'='*60}")
    print(f"  EVALUATION TEXT-TO-IMAGE -- mode={mode}  k={k}  seed={seed}")
    print(f"{'='*60}")
    print(f"  Requetes evaluees : {metrics.get('n_queries')}")

    for key, label in [
        ("precision_at_k", "resultats contenant les mots cles de la requete"),
        ("top1_hit",       "requetes avec au moins 1 resultat pertinent"),
    ]:
        val   = metrics.get(key)
        seuil = seuils.get(key)
        if val is None:
            continue
        status = "PASS" if val >= seuil else "FAIL"
        print(f"    {key:22s}: {val:.1%}  (seuil >= {seuil:.0%})  {status}  -- {label}")

    print()


# ---------------------------------------------------------------------------
# Sauvegarde CSV
# ---------------------------------------------------------------------------

def save_csv(
    metrics: dict,
    query_results: list[dict],
    result_details: list[dict],
    output_dir: Path,
    mode: str,
    k: int,
    seed: int,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = output_dir / f"eval_text_{mode}_seed{seed}_{timestamp}.csv"

    seuils = SEUILS[mode]

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["# MEDISCAN AI -- Evaluation text-to-image"])
        w.writerow(["# mode", mode])
        w.writerow(["# k", k])
        w.writerow(["# seed", seed])
        w.writerow(["# n_queries", metrics.get("n_queries")])
        w.writerow([])
        w.writerow(["metrique", "valeur", "seuil", "statut"])
        for key, seuil in seuils.items():
            val = metrics.get(key)
            if val is not None:
                status = "PASS" if val >= seuil else "FAIL"
                w.writerow([key, f"{val:.4f}", f"{seuil:.2f}", status])
        w.writerow([])
        w.writerow(["--- DETAILS PAR REQUETE ---"])
        if query_results:
            w.writerow(list(query_results[0].keys()))
            for row in query_results:
                w.writerow(list(row.values()))
        w.writerow([])
        w.writerow(["--- DETAILS PAR RESULTAT ---"])
        if result_details:
            w.writerow(list(result_details[0].keys()))
            for row in result_details:
                w.writerow(list(row.values()))

    return csv_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluation text-to-image MediScan")
    parser.add_argument("--mode", default="caption", choices=("caption", "keyword"))
    parser.add_argument("--k",          type=int, default=10)
    parser.add_argument("--n-queries",  type=int, default=200)
    parser.add_argument("--seed",       type=int, default=42)
    parser.add_argument("--output-dir", default="proofs/perf")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    resources = load_resources(mode="semantic")
    print(f"Index charge : {resources.index.ntotal} vecteurs, dim={resources.index.d}")

    if args.mode in ("caption", "both"):
        print(f"\n--- Mode caption-to-image ---")
        query_rows = pick_caption_rows(resources.rows, args.n_queries, args.seed)
        print(f"n_queries={len(query_rows)}  k={args.k}  seed={args.seed}")
        qr, rd = evaluate_caption(query_rows, resources, args.k)
        metrics = compute_metrics(qr, "caption")
        print_results(metrics, "caption", args.k, args.seed)
        csv_path = save_csv(metrics, qr, rd, resolve_path(args.output_dir), "caption", args.k, args.seed)
        print(f"Resultats sauvegardes : {csv_path}")

    if args.mode in ("keyword", "both"):
        print(f"\n--- Mode keyword-to-image ---")
        keywords = pick_keywords(args.n_queries, args.seed)
        print(f"n_keywords={len(keywords)}  k={args.k}  seed={args.seed}")
        qr, rd = evaluate_keyword(keywords, resources, args.k)
        metrics = compute_metrics(qr, "keyword")
        print_results(metrics, "keyword", args.k, args.seed)
        csv_path = save_csv(metrics, qr, rd, resolve_path(args.output_dir), "keyword", args.k, args.seed)
        print(f"Resultats sauvegardes : {csv_path}")


if __name__ == "__main__":
    main()