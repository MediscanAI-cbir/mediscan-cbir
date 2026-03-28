import os
from mediscan.runtime import SUPPORTED_MODES
from mediscan.search import MAX_K

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, env vars loaded from shell

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "mediscan_db"
COLLECTION_NAME = "results"

HF_BASE_URL = "https://huggingface.co/datasets/Mediscan-Team/mediscan-data/resolve/main"

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
ALLOWED_MODES = SUPPORTED_MODES

__all__ = ["MAX_K", "ALLOWED_CONTENT_TYPES", "ALLOWED_MODES", "MONGO_URI", "HF_BASE_URL"]
