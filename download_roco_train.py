import argparse
import csv
import json
from pathlib import Path

from datasets import load_dataset


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download the ROCOv2 radiology train split")
    parser.add_argument("output_dir", nargs="?", default="roco_train_full")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir)
    image_dir = output_dir / "images"
    metadata_csv = output_dir / "metadata.csv"
    metadata_jsonl = output_dir / "metadata.jsonl"

    output_dir.mkdir(parents=True, exist_ok=True)
    image_dir.mkdir(parents=True, exist_ok=True)

    print("Chargement du split train de ROCOv2-radiology...")
    dataset = load_dataset("eltorio/ROCOv2-radiology", split="train")
    print(f"Nombre d'exemples chargés : {len(dataset)}")

    with metadata_csv.open("w", newline="", encoding="utf-8") as csv_handle, metadata_jsonl.open(
        "w",
        encoding="utf-8",
    ) as jsonl_handle:
        writer = csv.DictWriter(csv_handle, fieldnames=["image_id", "path", "caption", "cui"])
        writer.writeheader()

        for index, sample in enumerate(dataset, start=1):
            image = sample["image"]
            image_id = sample["image_id"]
            caption = sample["caption"]
            cui = sample["cui"]

            extension = ".png"
            if getattr(image, "format", None):
                extension = "." + image.format.lower()

            file_name = f"{image_id}{extension}"
            output_path = image_dir / file_name
            image.save(output_path)

            row = {
                "image_id": image_id,
                "path": f"images/{file_name}",
                "caption": caption,
                "cui": json.dumps(cui, ensure_ascii=False),
            }
            writer.writerow(row)
            jsonl_handle.write(json.dumps(row, ensure_ascii=False) + "\n")

            if index % 1000 == 0:
                print(f"{index} images sauvegardées...")

    print("Téléchargement terminé.")
    print(f"Dossier : {output_dir.resolve()}")
    print(f"Images : {image_dir.resolve()}")
    print(f"Métadonnées CSV : {metadata_csv.resolve()}")
    print(f"Métadonnées JSONL : {metadata_jsonl.resolve()}")


if __name__ == "__main__":
    main()
