from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import router
from mediscan.process import configure_cpu_environment
from backend.app.services.search_service import SearchService
from mediscan.search import load_resources

configure_cpu_environment()


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Load heavy resources once at startup, release on shutdown."""
    visual = load_resources(mode="visual")
    semantic = load_resources(mode="semantic")
    application.state.search_service = SearchService(
        resources={"visual": visual, "semantic": semantic},
    )
    yield


app = FastAPI(title="MEDISCAN API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
