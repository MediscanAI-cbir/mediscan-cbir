"""Email delivery service for the MediScan contact form."""

import html
import os

import resend


class EmailConfigurationError(RuntimeError):
    """Raised when email configuration is incomplete or invalid."""


class EmailDeliveryError(RuntimeError):
    """Raised when an email could not be sent despite valid configuration."""


class EmailService:
    """Resend service for sending contact form messages."""

    def __init__(self) -> None:
        """
        Initialize the service by reading Resend environment variables.

        Required variables: RESEND_API_KEY, MEDISCAN_CONTACT_FROM_EMAIL,
        MEDISCAN_CONTACT_TO_EMAIL.
        """
        self.api_key = os.getenv("RESEND_API_KEY", "").strip()
        self.from_email = os.getenv("MEDISCAN_CONTACT_FROM_EMAIL", "").strip()
        self.to_email = os.getenv("MEDISCAN_CONTACT_TO_EMAIL", "").strip()
        self.reply_to_email = os.getenv("MEDISCAN_CONTACT_REPLY_TO_EMAIL", "").strip() or self.from_email
        resend.api_key = self.api_key

    def is_configured(self) -> bool:
        """Check that all required environment variables are defined."""
        required = [
            self.api_key,
            self.from_email,
            self.to_email,
        ]
        return all(required)

    def validate(self) -> None:
        """Validate Resend configuration and raise an exception when it is invalid."""
        if not self.is_configured():
            raise EmailConfigurationError(
                "Email service is not configured. Please set RESEND_API_KEY and "
                "the MEDISCAN_CONTACT_* environment variables."
            )

    def send_contact_email(self, *, name: str, email: str, subject: str, message: str) -> None:
        """Send a formatted contact email through Resend."""
        self.validate()

        safe_name = html.escape(name)
        safe_email = html.escape(email)
        safe_subject = html.escape(subject)
        safe_message = html.escape(message).replace("\n", "<br>")
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1a202c; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Nouveau message MediScan</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p><strong>Nom du contact :</strong> {safe_name}</p>
                        <p><strong>Email :</strong> <a href="mailto:{safe_email}">{safe_email}</a></p>
                        <p><strong>Objet :</strong> {safe_subject}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Message :</strong></p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #1a202c;">
                            {safe_message}
                        </div>
                    </div>
                    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                        Ceci est un message automatique envoye depuis le formulaire de contact MediScan.
                    </div>
                </div>
            </body>
        </html>
        """

        try:
            resend.Emails.send(
                {
                    "from": f"MediScan Contact <{self.from_email}>",
                    "to": self.to_email,
                    "reply_to": email,
                    "subject": f"[MediScan] {subject}",
                    "html": html_content,
                }
            )
        except Exception as exc:
            raise EmailDeliveryError("Unable to send the contact email.") from exc
