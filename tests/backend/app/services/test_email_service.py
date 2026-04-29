"""Tests for Resend email delivery service."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from backend.app.services import email_service
from backend.app.services.email_service import EmailConfigurationError, EmailDeliveryError, EmailService


def set_email_env(monkeypatch: pytest.MonkeyPatch, **overrides: str) -> None:
    """Set a complete Resend test environment."""
    values = {
        "RESEND_API_KEY": "re_test_key",
        "MEDISCAN_CONTACT_FROM_EMAIL": "from@example.com",
        "MEDISCAN_CONTACT_TO_EMAIL": "to@example.com",
        "MEDISCAN_CONTACT_REPLY_TO_EMAIL": "reply@example.com",
    }
    values.update(overrides)
    for key, value in values.items():
        monkeypatch.setenv(key, value)


def test_email_service_detects_missing_configuration(monkeypatch: pytest.MonkeyPatch) -> None:
    """Incomplete Resend environment is not considered configured."""
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    service = EmailService()

    assert service.is_configured() is False
    with pytest.raises(EmailConfigurationError, match="not configured"):
        service.validate()


def test_email_service_sets_resend_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    """Resend receives the API key from the environment."""
    set_email_env(monkeypatch)

    EmailService()

    assert email_service.resend.api_key == "re_test_key"


def test_send_contact_email_uses_resend(monkeypatch: pytest.MonkeyPatch) -> None:
    """Contact submissions are sent through Resend with escaped HTML content."""
    set_email_env(monkeypatch)
    send = MagicMock()
    monkeypatch.setattr(email_service.resend.Emails, "send", send)

    EmailService().send_contact_email(
        name="<Alice>",
        email="alice@example.com",
        subject="Hello",
        message="<b>Body</b>\nLine 2",
    )

    send.assert_called_once()
    payload = send.call_args.args[0]
    assert payload["from"] == "MediScan Contact <from@example.com>"
    assert payload["to"] == "to@example.com"
    assert payload["reply_to"] == "alice@example.com"
    assert payload["subject"] == "[MediScan] Hello"
    assert "&lt;Alice&gt;" in payload["html"]
    assert "&lt;b&gt;Body&lt;/b&gt;<br>Line 2" in payload["html"]


def test_send_contact_email_wraps_resend_errors(monkeypatch: pytest.MonkeyPatch) -> None:
    """Resend failures are reported as delivery errors."""
    set_email_env(monkeypatch)
    monkeypatch.setattr(email_service.resend.Emails, "send", MagicMock(side_effect=RuntimeError("down")))

    with pytest.raises(EmailDeliveryError, match="Unable to send"):
        EmailService().send_contact_email(
            name="Alice",
            email="alice@example.com",
            subject="Hello",
            message="Body",
        )
