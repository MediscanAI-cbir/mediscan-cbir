"""
Dataset helpers for the ROCO small subset.

This module defines:
- a strongly-typed record (`MetadataRecord`) matching one row of metadata.csv,
- a simple in-memory loader (`RocoSmallDataset`) that validates the CSV schema
  and provides deterministic iteration order.

Expected CSV schema (required columns):
- image_id : str
- path     : str (path to the image file, ideally relative to the repo root)
- caption  : str
- cui      : str (often JSON-encoded list; kept as raw string here)
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator


@dataclass(frozen=True)
class MetadataRecord:
    """
    One metadata row corresponding to one image.

    Attributes
    ----------
    image_id : str
        Unique identifier for the image.
    path : str
        File path to the image. This can be relative or absolute depending on how
        metadata.csv was produced.
    caption : str
        Natural language caption describing the image.
    cui : str
        UMLS Concept Unique Identifiers associated with the image.
        This is typically stored as a JSON string (e.g. '["C0011849", ...]').
        We keep it raw here and let higher layers decide how/when to parse it.
    """

    image_id: str
    path: str
    caption: str
    cui: str

    def to_dict(self) -> dict[str, str]:
        """
        Convert the record to a standard dictionary.

        Useful for:
        - logging / debug prints
        - JSON serialization
        - passing records to other layers (e.g., MongoDB import) without exposing
          dataclasses.
        """
        return {
            "image_id": self.image_id,
            "path": self.path,
            "caption": self.caption,
            "cui": self.cui,
        }


class RocoSmallDataset:
    """
    In-memory loader for `metadata.csv` with deterministic iteration order.

    Responsibilities:
    - read metadata.csv
    - validate that required columns exist
    - validate that each row has at least `image_id` and `path`
    - store all rows as `MetadataRecord` objects in memory

    Notes
    -----
    - The order is deterministic: records are stored in the same order as in CSV.
    - This class does not open image files; it only loads metadata.
      Image loading should be done by the embedder/query layer when needed.
    """

    REQUIRED_COLUMNS = ("image_id", "path", "caption", "cui")

    def __init__(self, metadata_csv: str | Path = "data/roco_small/metadata.csv") -> None:
        """
        Parameters
        ----------
        metadata_csv : str | Path
            Path to the metadata.csv file for the ROCO small subset.

        Raises
        ------
        FileNotFoundError
            If metadata.csv does not exist.
        """
        self.metadata_csv = Path(metadata_csv)
        if not self.metadata_csv.exists():
            raise FileNotFoundError(f"Metadata CSV not found: {self.metadata_csv}")

        self._records = self._load_records()

    def _load_records(self) -> list[MetadataRecord]:
        """
        Read and validate metadata records from CSV.

        Returns
        -------
        list[MetadataRecord]
            All records loaded in memory.

        Raises
        ------
        ValueError
            If the CSV has no header, misses required columns, or contains invalid rows.
        """
        records: list[MetadataRecord] = []

        with self.metadata_csv.open("r", newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)

            # CSV must have a header row
            if reader.fieldnames is None:
                raise ValueError(f"CSV file has no header: {self.metadata_csv}")

            # Validate required columns
            missing_columns = [
                column for column in self.REQUIRED_COLUMNS if column not in reader.fieldnames
            ]
            if missing_columns:
                raise ValueError(
                    "CSV missing required columns "
                    f"{missing_columns} in {self.metadata_csv}"
                )

            # Start=2 because row 1 is the header
            for row_number, row in enumerate(reader, start=2):
                image_id = (row.get("image_id") or "").strip()
                image_path = (row.get("path") or "").strip()
                caption = (row.get("caption") or "").strip()
                cui = (row.get("cui") or "").strip()

                # Minimal validity constraints
                if not image_id or not image_path:
                    raise ValueError(
                        f"Invalid row {row_number} in {self.metadata_csv}: "
                        "image_id and path are required"
                    )

                records.append(
                    MetadataRecord(
                        image_id=image_id,
                        path=image_path,
                        caption=caption,
                        cui=cui,
                    )
                )

        return records

    def __len__(self) -> int:
        """Return the number of records loaded."""
        return len(self._records)

    def __iter__(self) -> Iterator[MetadataRecord]:
        """Iterate over records in the same order as in metadata.csv."""
        return iter(self._records)

    @property
    def records(self) -> list[MetadataRecord]:
        """
        Return a copy of the records list.

        This prevents callers from mutating the internal list by accident.
        """
        return list(self._records)


__all__ = ["MetadataRecord", "RocoSmallDataset"]