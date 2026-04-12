"""Evaluation complete MediScan AI — mode visual et semantic.

Mode visual (DINOv2) :
    - TM  : Taux Modalite      (via ground truth MongoDB/CSV)
    - TA  : Taux Anatomie      (via ground truth MongoDB/CSV)
    - TMO : Taux Modalite+Organe combine (via ground truth MongoDB/CSV)
    - SSIM: Similarite structurelle pixel a pixel
    - HIST: Similarite histogramme niveaux de gris

Mode semantic (BioMedCLIP) :
    - TM         : Taux Modalite   (via ground truth MongoDB/CSV)
    - TA         : Taux Anatomie   (via ground truth MongoDB/CSV)
    - TMO        : Taux Modalite+Organe combine (via ground truth MongoDB/CSV)
    - Precision@k: Proportion de resultats partageant au moins 1 CUI avec la requete

Usage :
    python scripts/evaluation/evaluate_full.py --mode visual   --k 10 --n-queries 200 --seed 42
    python scripts/evaluation/evaluate_full.py --mode semantic --k 10 --n-queries 200 --seed 42
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import random
from datetime import datetime
from pathlib import Path

import numpy as np
from PIL import Image
from dotenv import load_dotenv

from mediscan.process import configure_cpu_environment
from mediscan.runtime import resolve_path
from mediscan.search import load_resources, query

load_dotenv()
configure_cpu_environment()

GT_MODALITY_CSV = Path("artifacts/ground_truth/ROCOv2_GLOABL_modality.csv")
GT_ORGAN_CSV    = Path("artifacts/ground_truth/ROCOv2_GLOABL_organ.csv")
GT_MO_CSV       = Path("artifacts/ground_truth/ROCOv2_GLOABL_mo.csv")

SEUILS = {
    "visual": {
        "TM_requetes":   0.90,
        "TM_resultats":  0.80,
        "TA_requetes":   0.70,
        "TA_resultats":  0.30,
        "TMO_requetes":  0.60,
        "TMO_resultats": 0.35,
        "SSIM_moyen":    0.20,
        "HIST_moyen":    0.50,
    },
    "semantic": {
        "TM_requetes":   0.80,
        "TM_resultats":  0.65,
        "TA_requetes":   0.60,
        "TA_resultats":  0.35,
        "TMO_requetes":  0.50,
        "TMO_resultats": 0.35,
        "precision_at_k": 0.30,
    },
}

CATEGORIES_PATH = Path("artifacts/cui_categories.json")


def load_ground_truth_from_csv(
    modality_csv: Path = GT_MODALITY_CSV,
    organ_csv: Path    = GT_ORGAN_CSV,
    mo_csv: Path       = GT_MO_CSV,
) -> dict[str, dict]:
    """Charge le ground truth depuis les CSV locaux."""
    gt: dict[str, dict] = {}

    def read_csv(path: Path, key: str) -> None:
        if not path.exists():
            print(f"[WARN] CSV introuvable : {path}")
            return
        with path.open(encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                img = row.get("img", "").strip()
                label = row.get("label", "").strip()
                if not img or not label:
                    continue
                image_id = Path(img).stem
                if image_id not in gt:
                    gt[image_id] = {"modalite": None, "organe": None, "mo": None}
                gt[image_id][key] = label

    read_csv(modality_csv, "modalite")
    read_csv(organ_csv,    "organe")
    read_csv(mo_csv,       "mo")

    print(f"Ground truth charge depuis CSV : {len(gt)} images annotees")
    _print_gt_stats(gt)
    return gt


def load_ground_truth_from_mongo(mongo_uri: str) -> dict[str, dict]:
    """Charge le ground truth depuis MongoDB."""
    from pymongo import MongoClient
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client['mediscan_db']
    gt: dict[str, dict] = {}
    for doc in db['results'].find(
        {},
        {"image_id": 1, "modalite": 1, "organe": 1, "mo": 1}
    ):
        image_id = doc.get("image_id", "")
        if image_id:
            gt[image_id] = {
                "modalite": doc.get("modalite"),
                "organe":   doc.get("organe"),
                "mo":       doc.get("mo"),
            }
    print(f"Ground truth charge depuis MongoDB : {len(gt)} images annotees")
    _print_gt_stats(gt)
    return gt


def load_ground_truth(
    mongo_uri: str | None = None,
    modality_csv: Path = GT_MODALITY_CSV,
    organ_csv: Path    = GT_ORGAN_CSV,
    mo_csv: Path       = GT_MO_CSV,
) -> dict[str, dict]:
    """Charge le ground truth depuis MongoDB si disponible, sinon depuis les CSV."""
    if mongo_uri:
        try:
            return load_ground_truth_from_mongo(mongo_uri)
        except Exception as e:
            print(f"[WARN] MongoDB indisponible ({e}), fallback sur CSV...")
    return load_ground_truth_from_csv(modality_csv, organ_csv, mo_csv)


def _print_gt_stats(gt: dict[str, dict]) -> None:
    n_modalite = sum(1 for v in gt.values() if v["modalite"])
    n_organe   = sum(1 for v in gt.values() if v["organe"])
    n_mo       = sum(1 for v in gt.values() if v["mo"])
    print(f"  Avec modalite : {n_modalite}")
    print(f"  Avec organe   : {n_organe}")
    print(f"  Avec mo       : {n_mo}")


def parse_cui(cui_raw: str) -> set[str]:
    if not cui_raw or not cui_raw.strip():
        return set()
    try:
        parsed = json.loads(cui_raw)
    except (json.JSONDecodeError, TypeError):
        return set()
    if not isinstance(parsed, list):
        return set()
    return {str(item).strip() for item in parsed if item}


def load_image_gray(path: Path) -> np.ndarray | None:
    try:
        with Image.open(path) as img:
            gray = img.convert("L").resize((128, 128))
            return np.array(gray, dtype=np.float32) / 255.0
    except Exception:
        return None


def compute_ssim(img1: np.ndarray, img2: np.ndarray) -> float:
    C1 = (0.01) ** 2
    C2 = (0.03) ** 2
    mu1 = img1.mean()
    mu2 = img2.mean()
    sigma1_sq = img1.var()
    sigma2_sq = img2.var()
    sigma12 = ((img1 - mu1) * (img2 - mu2)).mean()
    numerateur   = (2 * mu1 * mu2 + C1) * (2 * sigma12 + C2)
    denominateur = (mu1**2 + mu2**2 + C1) * (sigma1_sq + sigma2_sq + C2)
    return float(numerateur / denominateur) if denominateur != 0 else 0.0


def compute_hist_similarity(img1: np.ndarray, img2: np.ndarray, bins: int = 64) -> float:
    h1, _ = np.histogram(img1.flatten(), bins=bins, range=(0.0, 1.0))
    h2, _ = np.histogram(img2.flatten(), bins=bins, range=(0.0, 1.0))
    h1 = h1.astype(np.float32)
    h2 = h2.astype(np.float32)
    norm1 = h1.sum()
    norm2 = h2.sum()
    if norm1 == 0 or norm2 == 0:
        return 0.0
    h1 /= norm1
    h2 /= norm2
    return float(np.minimum(h1, h2).sum())


def pick_query_rows(
    rows: list[dict],
    gt: dict[str, dict],
    n: int,
    seed: int,
) -> list[dict]:
    evaluable = [r for r in rows if r.get("image_id", "") in gt]
    if not evaluable:
        raise ValueError("Aucune image avec ground truth trouvee dans l'index.")
    if n > len(evaluable):
        print(f"[WARN] Demande {n} requetes mais seulement {len(evaluable)} exploitables.")
        n = len(evaluable)
    return random.Random(seed).sample(evaluable, n)


def evaluate(
    query_rows: list[dict],
    resources,
    k: int,
    gt: dict[str, dict],
    mode: str,
) -> tuple[list[dict], list[dict]]:
    query_results: list[dict] = []
    result_details: list[dict] = []
    images_manquantes = 0

    for i, query_row in enumerate(query_rows, start=1):
        image_path = resolve_path(str(query_row.get("path", "")))
        if not image_path.exists():
            images_manquantes += 1
            continue

        query_id       = query_row.get("image_id", "")
        gt_query       = gt.get(query_id, {})
        modalite_query = gt_query.get("modalite")
        organe_query   = gt_query.get("organe")
        mo_query       = gt_query.get("mo")
        cui_query      = parse_cui(query_row.get("cui", ""))

        results = query(resources=resources, image=image_path, k=k, exclude_self=True)
        img_query_gray = load_image_gray(image_path) if mode == "visual" else None

        hit_modalite = False
        hit_organe   = False
        hit_mo       = False
        ssim_scores  = []
        hist_scores  = []
        precision_hits = []

        for result in results:
            result_id       = result.get("image_id", "")
            gt_result       = gt.get(result_id, {})
            modalite_result = gt_result.get("modalite")
            organe_result   = gt_result.get("organe")
            mo_result       = gt_result.get("mo")

            match_m  = bool(modalite_query and modalite_result and modalite_query == modalite_result)
            match_a  = bool(organe_query   and organe_result   and organe_query   == organe_result)
            match_mo = bool(mo_query       and mo_result       and mo_query       == mo_result)

            if match_m:  hit_modalite = True
            if match_a:  hit_organe   = True
            if match_mo: hit_mo       = True

            cui_result_set = parse_cui(result.get("cui", ""))
            n_cui_communs  = len(cui_query & cui_result_set)
            precision_hits.append(1 if n_cui_communs >= 1 else 0)

            ssim_val = None
            hist_val = None
            if mode == "visual" and img_query_gray is not None:
                result_path = resolve_path(str(result.get("path", "")))
                if result_path.exists():
                    img_result_gray = load_image_gray(result_path)
                    if img_result_gray is not None:
                        ssim_val = compute_ssim(img_query_gray, img_result_gray)
                        hist_val = compute_hist_similarity(img_query_gray, img_result_gray)
                        ssim_scores.append(ssim_val)
                        hist_scores.append(hist_val)

            detail = {
                "query_id":         query_id,
                "result_id":        result_id,
                "score_faiss":      result["score"],
                "match_modalite":   int(match_m),
                "match_organe":     int(match_a),
                "match_mo":         int(match_mo),
                "n_cui_communs":    n_cui_communs,
                "query_has_organe": int(bool(organe_query)),
                "query_has_mo":     int(bool(mo_query)),
            }
            if mode == "visual":
                detail["ssim"]            = round(ssim_val, 4) if ssim_val is not None else None
                detail["hist_similarity"] = round(hist_val, 4) if hist_val is not None else None

            result_details.append(detail)

        query_result = {
            "query_id":       query_id,
            "modalite_query": modalite_query,
            "organe_query":   organe_query,
            "mo_query":       mo_query,
            "hit_modalite":   int(hit_modalite),
            "hit_organe":     int(hit_organe),
            "hit_mo":         int(hit_mo),
            "has_organe":     int(bool(organe_query)),
            "has_mo":         int(bool(mo_query)),
            "n_results":      len(results),
            "precision_at_k": sum(precision_hits) / len(precision_hits) if precision_hits else 0.0,
        }
        if mode == "visual":
            query_result["ssim_moyen"] = float(np.mean(ssim_scores)) if ssim_scores else None
            query_result["hist_moyen"] = float(np.mean(hist_scores)) if hist_scores else None

        query_results.append(query_result)

        if i % 20 == 0:
            print(f"  Evalue {i}/{len(query_rows)} requetes...")

    if images_manquantes > 0:
        print(f"[WARN] {images_manquantes} images introuvables ignorees sur {len(query_rows)} requetes.")

    return query_results, result_details


def compute_metrics(
    query_results: list[dict],
    result_details: list[dict],
    mode: str,
) -> dict[str, float | None]:
    total_q = len(query_results)
    total_r = len(result_details)

    if total_q == 0:
        return {}

    tm_requetes  = sum(r["hit_modalite"] for r in query_results) / total_q
    tm_resultats = sum(r["match_modalite"] for r in result_details) / total_r if total_r else 0.0

    q_avec_organe = [r for r in query_results if r["has_organe"]]
    ta_requetes = (
        sum(r["hit_organe"] for r in q_avec_organe) / len(q_avec_organe)
        if q_avec_organe else None
    )
    r_avec_organe = [r for r in result_details if r["query_has_organe"]]
    ta_resultats = (
        sum(r["match_organe"] for r in r_avec_organe) / len(r_avec_organe)
        if r_avec_organe else None
    )

    q_avec_mo = [r for r in query_results if r["has_mo"]]
    tmo_requetes = (
        sum(r["hit_mo"] for r in q_avec_mo) / len(q_avec_mo)
        if q_avec_mo else None
    )
    r_avec_mo = [r for r in result_details if r["query_has_mo"]]
    tmo_resultats = (
        sum(r["match_mo"] for r in r_avec_mo) / len(r_avec_mo)
        if r_avec_mo else None
    )

    precision_at_k = sum(r["precision_at_k"] for r in query_results) / total_q

    metrics: dict[str, float | None] = {
        "TM_requetes":   tm_requetes,
        "TM_resultats":  tm_resultats,
        "TA_requetes":   ta_requetes,
        "TA_resultats":  ta_resultats,
        "TMO_requetes":  tmo_requetes,
        "TMO_resultats": tmo_resultats,
        "precision_at_k": precision_at_k,
        "n_queries_total":       total_q,
        "n_queries_avec_organe": len(q_avec_organe),
        "n_queries_avec_mo":     len(q_avec_mo),
        "n_results_total":       total_r,
    }

    if mode == "visual":
        ssim_vals = [r["ssim_moyen"] for r in query_results if r.get("ssim_moyen") is not None]
        hist_vals = [r["hist_moyen"] for r in query_results if r.get("hist_moyen") is not None]
        metrics["SSIM_moyen"] = float(np.mean(ssim_vals)) if ssim_vals else None
        metrics["HIST_moyen"] = float(np.mean(hist_vals)) if hist_vals else None

    return metrics


def print_results(metrics: dict, mode: str, k: int, seed: int) -> None:
    seuils = SEUILS[mode]

    print(f"\n{'='*60}")
    print(f"  EVALUATION GROUND TRUTH -- mode={mode}  k={k}  seed={seed}")
    print(f"{'='*60}")
    print(f"  Requetes evaluees : {metrics.get('n_queries_total')}")
    print(f"  Resultats totaux  : {metrics.get('n_results_total')}")

    print(f"\n  --- TM -- Taux Modalite ---")
    _print_metric("TM_requetes",  metrics, seuils, "requetes trouvant meme modalite")
    _print_metric("TM_resultats", metrics, seuils, "resultats de meme modalite")

    n_a = metrics.get("n_queries_avec_organe", 0)
    print(f"\n  --- TA -- Taux Anatomie (base : {n_a} requetes avec organe) ---")
    _print_metric("TA_requetes",  metrics, seuils, "requetes trouvant meme organe")
    _print_metric("TA_resultats", metrics, seuils, "resultats de meme organe")

    n_mo = metrics.get("n_queries_avec_mo", 0)
    print(f"\n  --- TMO -- Modalite+Organe combine (base : {n_mo} requetes) ---")
    _print_metric("TMO_requetes",  metrics, seuils, "requetes trouvant meme modalite+organe")
    _print_metric("TMO_resultats", metrics, seuils, "resultats de meme modalite+organe")

    print(f"\n  --- Precision@k (via CUI) ---")
    _print_metric("precision_at_k", metrics, seuils, "resultats partageant >= 1 CUI avec la requete")

    if mode == "visual":
        print(f"\n  --- Metriques visuelles (pixels) ---")
        _print_metric("SSIM_moyen", metrics, seuils, "SSIM moyen sur tous les resultats")
        _print_metric("HIST_moyen", metrics, seuils, "Similarite histogramme moyenne")

    print()


def _print_metric(key: str, metrics: dict, seuils: dict, label: str) -> None:
    val = metrics.get(key)
    if val is None:
        print(f"    {key:22s}: N/A  (aucune requete eligible)")
        return
    seuil = seuils.get(key)
    if seuil is None:
        print(f"    {key:22s}: {val:.1%}  -- {label}")
        return
    status = "PASS" if val >= seuil else "FAIL"
    print(f"    {key:22s}: {val:.1%}  (seuil >= {seuil:.0%})  {status}  -- {label}")


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
    csv_path = output_dir / f"eval_gt_{mode}_seed{seed}_{timestamp}.csv"

    seuils = SEUILS[mode]

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["# MEDISCAN AI -- Evaluation ground truth"])
        w.writerow(["# mode", mode])
        w.writerow(["# k", k])
        w.writerow(["# seed", seed])
        w.writerow(["# n_queries", metrics.get("n_queries_total")])
        w.writerow(["# n_results", metrics.get("n_results_total")])
        w.writerow([])
        w.writerow(["metrique", "valeur", "seuil", "statut", "description"])
        for key, seuil in seuils.items():
            val = metrics.get(key)
            if val is None:
                w.writerow([key, "N/A", f"{seuil:.2f}", "N/A", "pas de requete eligible"])
            else:
                status = "PASS" if val >= seuil else "FAIL"
                w.writerow([key, f"{val:.4f}", f"{seuil:.2f}", status, ""])
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluation MediScan avec ground truth")
    parser.add_argument("--mode",         default="visual", choices=("visual", "semantic"))
    parser.add_argument("--k",            type=int, default=10)
    parser.add_argument("--n-queries",    type=int, default=200)
    parser.add_argument("--seed",         type=int, default=42)
    parser.add_argument("--output-dir",   default="proofs/perf")
    parser.add_argument("--modality-csv", default=str(GT_MODALITY_CSV))
    parser.add_argument("--organ-csv",    default=str(GT_ORGAN_CSV))
    parser.add_argument("--mo-csv",       default=str(GT_MO_CSV))
    parser.add_argument("--no-mongo",     action="store_true", help="Forcer l'utilisation des CSV")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    mongo_uri = None if args.no_mongo else os.getenv('MONGO_URI')

    gt = load_ground_truth(
        mongo_uri=mongo_uri,
        modality_csv=Path(args.modality_csv),
        organ_csv=Path(args.organ_csv),
        mo_csv=Path(args.mo_csv),
    )

    resources = load_resources(mode=args.mode)
    print(f"Index charge : {resources.index.ntotal} vecteurs, dim={resources.index.d}")

    query_rows = pick_query_rows(resources.rows, gt, args.n_queries, args.seed)
    print(f"mode={args.mode}  k={args.k}  n_queries={len(query_rows)}  seed={args.seed}")

    query_results, result_details = evaluate(
        query_rows, resources, args.k, gt, args.mode
    )
    metrics = compute_metrics(query_results, result_details, args.mode)
    print_results(metrics, args.mode, args.k, args.seed)

    csv_path = save_csv(
        metrics, query_results, result_details,
        resolve_path(args.output_dir),
        args.mode, args.k, args.seed,
    )
    print(f"Resultats sauvegardes : {csv_path}")


if __name__ == "__main__":
    main()