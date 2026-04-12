from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.app.config import MAX_UPLOAD_BYTES
from backend.app.image_utils import hf_image_url
from backend.app.main import app
from backend.app.services.analysis_service import ClinicalConclusionError
from backend.app.services.email_service import EmailConfigurationError, EmailDeliveryError
from backend.app.services.search_service import SearchService, SearchUnavailableError
from mediscan.search import SearchResources


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

class FakeEmbedder:
    name = "dinov2_base"
    dim = 768


def _make_fake_service() -> SearchService:
    """Build a SearchService with mocked resources (no real model loaded)."""
    fake_resources = MagicMock(spec=SearchResources)
    fake_resources.embedder = FakeEmbedder()
    return SearchService(resources={"visual": fake_resources, "semantic": fake_resources})


@pytest.fixture()
def client():
    """TestClient with a fake SearchService injected into app.state."""
    app.state.search_service = _make_fake_service()
    app.state.email_service = MagicMock()
    return TestClient(app, raise_server_exceptions=False)


def make_png_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (8, 8), color=(255, 0, 0)).save(buffer, format="PNG")
    return buffer.getvalue()


def make_jpeg_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (8, 8), color=(0, 255, 0)).save(buffer, format="JPEG")
    return buffer.getvalue()


# ---------------------------------------------------------------------------
# GET /api/health
# ---------------------------------------------------------------------------

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# POST /api/search — success cases
# ---------------------------------------------------------------------------

@patch("backend.app.services.search_service.query")
def test_search_returns_results_visual(mock_query, client):
    mock_query.return_value = [
        {
            "rank": 1,
            "image_id": "ROCOv2_2023_train_000001",
            "score": 0.9,
            "path": "p.png",
            "caption": "c",
            "cui": "[]",
        },
    ]
    response = client.post(
        "/api/search",
        files={"image": ("query.png", make_png_bytes(), "image/png")},
        data={"mode": "visual", "k": "1"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "visual"
    assert payload["embedder"] == "dinov2_base"
    assert len(payload["results"]) == 1
    assert payload["results"][0]["image_id"] == "ROCOv2_2023_train_000001"
    assert payload["results"][0]["path"] == hf_image_url("ROCOv2_2023_train_000001")


@patch("backend.app.services.search_service.query")
def test_search_returns_results_semantic(mock_query, client):
    mock_query.return_value = [
        {
            "rank": 1,
            "image_id": "ROCOv2_2023_train_000002",
            "score": 0.85,
            "path": "p.png",
            "caption": "c",
            "cui": "[]",
        },
    ]
    response = client.post(
        "/api/search",
        files={"image": ("query.jpg", make_jpeg_bytes(), "image/jpeg")},
        data={"mode": "semantic", "k": "3"},
    )
    assert response.status_code == 200
    assert response.json()["mode"] == "semantic"
    assert response.json()["results"][0]["path"] == hf_image_url("ROCOv2_2023_train_000002")


@patch("backend.app.services.search_service.query")
def test_search_default_mode_and_k(mock_query, client):
    mock_query.return_value = []
    response = client.post(
        "/api/search",
        files={"image": ("q.png", make_png_bytes(), "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["mode"] == "visual"


# ---------------------------------------------------------------------------
# POST /api/search — error cases
# ---------------------------------------------------------------------------

def test_search_rejects_invalid_mode(client):
    response = client.post(
        "/api/search",
        files={"image": ("q.png", make_png_bytes(), "image/png")},
        data={"mode": "invalid", "k": "5"},
    )
    assert response.status_code == 400
    assert "Unsupported mode" in response.json()["detail"]


def test_search_rejects_k_zero(client):
    response = client.post(
        "/api/search",
        files={"image": ("q.png", make_png_bytes(), "image/png")},
        data={"mode": "visual", "k": "0"},
    )
    assert response.status_code == 400
    assert "k must be" in response.json()["detail"]


def test_search_rejects_k_too_large(client):
    response = client.post(
        "/api/search",
        files={"image": ("q.png", make_png_bytes(), "image/png")},
        data={"mode": "visual", "k": "999"},
    )
    assert response.status_code == 400
    assert "k must be" in response.json()["detail"]


def test_search_rejects_invalid_content_type(client):
    response = client.post(
        "/api/search",
        files={"image": ("q.txt", b"not-an-image", "text/plain")},
        data={"mode": "visual", "k": "5"},
    )
    assert response.status_code == 400
    assert "JPEG and PNG" in response.json()["detail"]


def test_search_rejects_empty_image(client):
    response = client.post(
        "/api/search",
        files={"image": ("q.png", b"", "image/png")},
        data={"mode": "visual", "k": "5"},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_search_rejects_image_over_size_limit(client):
    response = client.post(
        "/api/search",
        files={"image": ("q.png", b"0" * (MAX_UPLOAD_BYTES + 1), "image/png")},
        data={"mode": "visual", "k": "5"},
    )
    assert response.status_code == 413
    assert "limit" in response.json()["detail"].lower()


def test_search_rejects_corrupted_image(client):
    response = client.post(
        "/api/search",
        files={"image": ("q.png", b"not-a-real-png", "image/png")},
        data={"mode": "visual", "k": "5"},
    )
    assert response.status_code == 400
    assert "Invalid image" in response.json()["detail"]


def test_search_returns_503_when_mode_resources_are_missing():
    fake_resources = MagicMock(spec=SearchResources)
    fake_resources.embedder = FakeEmbedder()
    service = SearchService(resources={"visual": fake_resources})

    with patch.object(service, "_get_resources", side_effect=SearchUnavailableError("mode unavailable")):
        app.state.search_service = service
        client = TestClient(app, raise_server_exceptions=False)
        response = client.post(
            "/api/search",
            files={"image": ("q.png", make_png_bytes(), "image/png")},
            data={"mode": "semantic", "k": "5"},
        )

    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# GET /api/images/{image_id}
# ---------------------------------------------------------------------------

def test_get_image_redirects_to_huggingface(client):
    image_id = "ROCOv2_2023_train_000123"
    response = client.get(f"/api/images/{image_id}", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == hf_image_url(image_id)


def test_get_image_rejects_dots_in_id(client):
    response = client.get("/api/images/..passwd")
    assert response.status_code == 400
    assert "Invalid image ID" in response.json()["detail"]


def test_get_image_rejects_special_characters(client):
    response = client.get("/api/images/img@evil")
    assert response.status_code == 400
    assert "Invalid image ID" in response.json()["detail"]


# ---------------------------------------------------------------------------
# POST /api/search-by-id and /api/search-by-ids
# ---------------------------------------------------------------------------

def test_search_by_id_returns_results(client):
    app.state.search_service.search_by_id = MagicMock(
        return_value={
            "mode": "visual",
            "embedder": "dinov2_base",
            "query_image_id": "ROCOv2_2023_train_000123",
            "results": [
                {
                    "rank": 1,
                    "image_id": "ROCOv2_2023_train_000456",
                    "score": 0.91,
                    "path": "local/path.png",
                    "caption": "match",
                    "cui": "[]",
                }
            ],
        }
    )

    response = client.post(
        "/api/search-by-id",
        json={"image_id": "ROCOv2_2023_train_000123", "mode": "visual", "k": 1},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["query_image_id"] == "ROCOv2_2023_train_000123"
    assert payload["results"][0]["path"] == hf_image_url("ROCOv2_2023_train_000456")


def test_search_by_ids_returns_results(client):
    app.state.search_service.search_by_ids = MagicMock(
        return_value={
            "mode": "semantic",
            "embedder": "biomedclip",
            "query_image_ids": ["ROCOv2_2023_train_000123", "ROCOv2_2023_train_000124"],
            "results": [
                {
                    "rank": 1,
                    "image_id": "ROCOv2_2023_train_000789",
                    "score": 0.88,
                    "path": "local/path.png",
                    "caption": "multi match",
                    "cui": "[]",
                }
            ],
        }
    )

    response = client.post(
        "/api/search-by-ids",
        json={
            "image_ids": ["ROCOv2_2023_train_000123", "ROCOv2_2023_train_000124"],
            "mode": "semantic",
            "k": 1,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["query_image_ids"] == ["ROCOv2_2023_train_000123", "ROCOv2_2023_train_000124"]
    assert payload["results"][0]["path"] == hf_image_url("ROCOv2_2023_train_000789")


# ---------------------------------------------------------------------------
# POST /api/generate-conclusion
# ---------------------------------------------------------------------------

@patch("backend.app.api.routes.generate_clinical_conclusion")
def test_generate_conclusion_returns_summary(mock_generate, client):
    mock_generate.return_value = "Resume de recherche."

    response = client.post(
        "/api/generate-conclusion",
        json={
            "mode": "visual",
            "results": [
                {
                    "rank": 1,
                    "image_id": "ROCOv2_2023_train_000123",
                    "score": 0.95,
                    "caption": "bilateral opacity",
                }
            ],
        },
    )

    assert response.status_code == 200
    assert response.json() == {"conclusion": "Resume de recherche."}


def test_generate_conclusion_rejects_empty_results(client):
    response = client.post(
        "/api/generate-conclusion",
        json={"mode": "visual", "results": []},
    )

    assert response.status_code == 422


@patch("backend.app.api.routes.generate_clinical_conclusion")
def test_generate_conclusion_returns_503_when_llm_unavailable(mock_generate, client):
    mock_generate.side_effect = ClinicalConclusionError("Service indisponible")

    response = client.post(
        "/api/generate-conclusion",
        json={
            "mode": "visual",
            "results": [
                {
                    "rank": 1,
                    "image_id": "ROCOv2_2023_train_000123",
                    "score": 0.95,
                    "caption": "bilateral opacity",
                }
            ],
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "Service indisponible"


# ---------------------------------------------------------------------------
# POST /api/contact
# ---------------------------------------------------------------------------

def test_contact_sends_email(client):
    email_service = MagicMock()
    app.state.email_service = email_service

    response = client.post(
        "/api/contact",
        json={
            "name": "Alice Martin",
            "email": "alice@example.com",
            "subject": "Question produit",
            "message": "Bonjour, je souhaite en savoir plus.",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Contact email sent successfully.",
    }
    email_service.send_contact_email.assert_called_once_with(
        name="Alice Martin",
        email="alice@example.com",
        subject="Question produit",
        message="Bonjour, je souhaite en savoir plus.",
    )


def test_contact_returns_503_when_email_is_not_configured(client):
    email_service = MagicMock()
    email_service.send_contact_email.side_effect = EmailConfigurationError("SMTP not configured")
    app.state.email_service = email_service

    response = client.post(
        "/api/contact",
        json={
            "name": "Alice Martin",
            "email": "alice@example.com",
            "subject": "Question produit",
            "message": "Bonjour, je souhaite en savoir plus.",
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "SMTP not configured"


def test_contact_returns_502_when_email_delivery_fails(client):
    email_service = MagicMock()
    email_service.send_contact_email.side_effect = EmailDeliveryError("SMTP send failed")
    app.state.email_service = email_service

    response = client.post(
        "/api/contact",
        json={
            "name": "Alice Martin",
            "email": "alice@example.com",
            "subject": "Question produit",
            "message": "Bonjour, je souhaite en savoir plus.",
        },
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "SMTP send failed"
