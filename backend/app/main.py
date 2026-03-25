import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import router
from mediscan.process import configure_cpu_environment
from backend.app.services.search_service import SearchService

configure_cpu_environment()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Start quickly and load heavy search resources on demand."""
    application.state.search_service = SearchService(resources={})
    logger.info("Search resources will be loaded lazily on the first request.")
    yield


app = FastAPI(title="MEDISCAN API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
