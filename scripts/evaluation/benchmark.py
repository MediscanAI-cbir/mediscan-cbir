"""
Measure retrieval performance metrics for MEDISCAN.
 
This script benchmarks the end-to-end retrieval pipeline (embedding + FAISS search)
for a given mode (visual or semantic). It runs a configurable number of queries
against a FAISS index, computes timing statistics, checks predefined thresholds,
and exports results to a CSV file.
 
Typical usage::
    - python benchmark.py --mode visual --k 10 --n-queries 50
 
Output:
    - A CSV file saved in "proofs/perf/" containing per-query timings and
      aggregate statistics (min, max, mean, dispersion, stability ratio).
"""

from __future__ import annotations

import argparse
import csv
import random
import time
from datetime import datetime
from pathlib import Path

import faiss
import numpy as np
from PIL import Image

from mediscan.process import configure_cpu_environment
from mediscan.runtime import build_embedder, default_config_for_mode, resolve_path, set_faiss_threads

configure_cpu_environment()

""" Maximum acceptable mean end-to-end latency (seconds). """
SEUIL_TE2E_30K = 5.0
""" Maximum acceptable stability ratio (dispersion / mean) across queries. """
SEUIL_STABILITE = 0.20


def parse_args() -> argparse.Namespace:
    """ Parse and return command-line arguments. """
    parser = argparse.ArgumentParser(description="Benchmark MEDISCAN retrieval")
    parser.add_argument("--mode", default="visual", choices=("visual", "semantic"))
    parser.add_argument("--k", type=int, default=10)
    parser.add_argument("--n-queries", type=int, default=20)
    parser.add_argument("--n-warmup", type=int, default=3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--embedder", default=None, help="Optional embedder override")
    parser.add_argument("--model-name", default=None)
    parser.add_argument("--index-path", default=None)
    parser.add_argument("--images-dir", default="data/roco_train_full/images")
    parser.add_argument("--output-dir", default="proofs/perf")
    return parser.parse_args()


def load_index(index_path: Path) -> faiss.Index:
    """
    Load a FAISS index from disk.
 
    Raises
    ------
    FileNotFoundError
        If "index_path" does not exist.
    """
    if not index_path.exists():
        raise FileNotFoundError(f"Index FAISS introuvable : {index_path}")
    index = faiss.read_index(str(index_path))
    print(f"Index chargé : {index.ntotal} vecteurs, dim={index.d}")
    return index


def pick_query_images(images_dir: Path, n: int, seed: int) -> list[Path]:
    """
    Randomly sample "n" images from a directory.
 
    Raises
    ------
    FileNotFoundError
        If no images are found in "images_dir".
    ValueError
        If "n" exceeds the number of available images.
    """
    all_images = sorted(images_dir.glob("*.png")) + sorted(images_dir.glob("*.jpg"))
    if not all_images:
        raise FileNotFoundError(f"Aucune image trouvée dans {images_dir}")
    if n > len(all_images):
        raise ValueError(f"Demandé {n} requêtes mais seulement {len(all_images)} images disponibles")
    return random.Random(seed).sample(all_images, n)


def measure_one_query(image_path: Path, embedder, index: faiss.Index, k: int) -> dict[str, float]:
    """
    Run a single retrieval query and return its timing breakdown.
 
    Opens the image, encodes it into a normalised embedding vector, and runs
    a FAISS nearest-neighbour search. Returns four timing metrics (in seconds):
 
    - "tembed"  : image encoding time
    - "tsearch" : FAISS search time
    - "tserver" : combined server-side time ("tembed + tsearch")
    - "te2e"    : total end-to-end wall-clock time
 
    Parameters
    ----------
    image_path : Path
        Path to the query image file.
    embedder : any
        Embedder instance with an ``encode_pil(image)`` method and a ``dim`` attribute.
    index : faiss.Index
        FAISS index to search against.
    k : int
        Number of nearest neighbours to retrieve.
 
    Returns
    -------
    dict[str, float]
        Keys: "tembed", "tsearch", "tserver", "te2e".
    """
    te2e_start = time.perf_counter()

    with Image.open(image_path) as image:
        rgb_image = image.convert("RGB")
        tembed_start = time.perf_counter()
        vector = embedder.encode_pil(rgb_image)
        tembed_end = time.perf_counter()

    query_vector = vector.reshape(1, -1).astype(np.float32)
    faiss.normalize_L2(query_vector)

    tsearch_start = time.perf_counter()
    index.search(query_vector, k)
    tsearch_end = time.perf_counter()

    tembed = tembed_end - tembed_start
    tsearch = tsearch_end - tsearch_start
    te2e = time.perf_counter() - te2e_start
    return {
        "tembed": tembed,
        "tsearch": tsearch,
        "tserver": tembed + tsearch,
        "te2e": te2e,
    }


def compute_stats(values: list[float]) -> dict[str, float]:
    """
    Compute min, max, mean, dispersion and stability ratio for a list of values.
 
    Returns
    -------
    dict[str, float]
        Keys: "min", "max", "moyenne", "dispersion", "stabilite_ratio".
    """
    minimum = min(values)
    maximum = max(values)
    average = sum(values) / len(values)
    dispersion = maximum - minimum
    stability_ratio = (dispersion / average) if average > 0 else 0.0
    return {
        "min": minimum,
        "max": maximum,
        "moyenne": average,
        "dispersion": dispersion,
        "stabilite_ratio": stability_ratio,
    }


def check_seuils(stats_te2e: dict[str, float]) -> None:
    """ Print a threshold check for mean end-to-end latency and stability ratio. """
    average = stats_te2e["moyenne"]
    stability = stats_te2e["stabilite_ratio"]
    print(f"te2e moyen: {average:.3f}s (seuil <= {SEUIL_TE2E_30K}s)")
    print(f"stabilité : {stability:.1%} (seuil <= {SEUIL_STABILITE:.0%})")


def save_csv(
    results: list[dict[str, float]],
    stats: dict[str, dict[str, float]],
    output_dir: Path,
    mode: str,
    k: int,
    n_images: int,
) -> Path:
    """
    Save per-query timings and aggregate statistics to a timestamped CSV file.
 
    The file is written to ``output_dir/perf_measures_<timestamp>.csv`` and
    contains two sections: individual query rows followed by a statistics block.
 
    Parameters
    ----------
    results : list[dict[str, float]]
        Per-query timing dictionaries, as returned by :func:"measure_one_query".
    stats : dict[str, dict[str, float]]
        Per-metric statistics, as returned by :func:"compute_stats".
    output_dir : Path
        Destination directory (created if absent).
    mode : str
        Retrieval mode used ("visual" or "semantic").
    k : int
        Number of nearest neighbours retrieved per query.
    n_images : int
        Total number of vectors in the FAISS index.
 
    Returns
    -------
    Path
        Path to the saved CSV file.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = output_dir / f"perf_measures_{timestamp}.csv"

    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["# MEDISCAN AI — Mesures de performance"])
        writer.writerow(["# Mode", mode])
        writer.writerow(["# k", k])
        writer.writerow(["# N images dans index", n_images])
        writer.writerow(["# N requêtes mesurées", len(results)])
        writer.writerow([])
        writer.writerow(["requete", "tembed_s", "tsearch_s", "tserver_s", "te2e_s"])
        for i, row in enumerate(results, start=1):
            writer.writerow([
                i,
                f"{row['tembed']:.4f}",
                f"{row['tsearch']:.4f}",
                f"{row['tserver']:.4f}",
                f"{row['te2e']:.4f}",
            ])
        writer.writerow([])
        writer.writerow(["# STATISTIQUES"])
        writer.writerow(["metrique", "min_s", "max_s", "moyenne_s", "dispersion_s", "stabilite_%"])
        for metric, metric_stats in stats.items():
            writer.writerow([
                metric,
                f"{metric_stats['min']:.4f}",
                f"{metric_stats['max']:.4f}",
                f"{metric_stats['moyenne']:.4f}",
                f"{metric_stats['dispersion']:.4f}",
                f"{metric_stats['stabilite_ratio']:.1%}",
            ])
    return csv_path


def main() -> None:
    """
    Entry point for the MEDISCAN benchmark script.
 
    Orchestrates the full benchmark pipeline:
 
    1. Parse and validate CLI arguments.
    2. Load the FAISS index and initialise the embedder.
    3. Check dimension compatibility between index and embedder.
    4. Sample query images and run warmup passes (excluded from metrics).
    5. Run the measured queries and collect timing results.
    6. Compute statistics and check performance thresholds.
    7. Export results to a timestamped CSV file.
 
    Raises
    ------
    ValueError
        If "--k", "--n-queries", or "--n-warmup" receive invalid values.
    RuntimeError
        If the FAISS index dimension does not match the embedder output dimension.
    FileNotFoundError
        If the index file or images directory cannot be found.
    """
    args = parse_args()
    if args.k <= 0:
        raise ValueError("--k doit être strictement positif")
    if args.n_queries <= 0:
        raise ValueError("--n-queries doit être strictement positif")
    if args.n_warmup < 0:
        raise ValueError("--n-warmup doit être positif ou nul")

    set_faiss_threads(faiss)
    default_embedder, default_index_path, _ = default_config_for_mode(args.mode)
    embedder_name = args.embedder or default_embedder
    index_path = resolve_path(args.index_path) if args.index_path else default_index_path
    images_dir = resolve_path(args.images_dir)

    index = load_index(index_path)
    embedder = build_embedder(embedder_name, model_name=args.model_name)
    if index.d != embedder.dim:
        raise RuntimeError(
            f"Index dimension ({index.d}) incompatible avec l'embedder "
            f"'{embedder_name}' ({embedder.dim})"
        )

    query_images = pick_query_images(images_dir, args.n_warmup + args.n_queries, args.seed)
    for image_path in query_images[: args.n_warmup]:
        measure_one_query(image_path, embedder, index, args.k)

    results = [
        measure_one_query(image_path, embedder, index, args.k)
        for image_path in query_images[args.n_warmup :]
    ]

    stats = {
        metric: compute_stats([result[metric] for result in results])
        for metric in ("tembed", "tsearch", "tserver", "te2e")
    }
    check_seuils(stats["te2e"])

    csv_path = save_csv(results, stats, resolve_path(args.output_dir), args.mode, args.k, index.ntotal)
    print(f"Résultats sauvegardés : {csv_path}")

if __name__ == "__main__":
    main()
