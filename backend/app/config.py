import os
from dotenv import load_dotenv
from mediscan.runtime import SUPPORTED_MODES
from mediscan.search import MAX_K

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "mediscan_db"
COLLECTION_NAME = "results"

HF_ZIP_URL = "https://huggingface.co/datasets/Mediscan-Team/mediscan-data/resolve/main"

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
ALLOWED_MODES = SUPPORTED_MODES

__all__ = ["MAX_K", "ALLOWED_CONTENT_TYPES", "ALLOWED_MODES", "MONGO_URI", "HF_ZIP_URL"]