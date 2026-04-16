"""
Service d'envoi d'emails pour le formulaire de contact Mediscan.

Ce module gère l'envoi de messages de contact par email via SMTP.
La configuration est entièrement pilotée par des variables d'environnement
(MEDISCAN_SMTP_*, MEDISCAN_CONTACT_*), rendant le service optionnel :
si les variables ne sont pas définies, le service refuse proprement les requêtes.
"""

import os
import smtplib
import ssl
from email.message import EmailMessage


class EmailConfigurationError(RuntimeError):
    """
    Lancé lorsque la configuration SMTP est incomplète ou invalide.
    Indique que les variables d'environnement requises ne sont pas toutes définies.
    """


class EmailDeliveryError(RuntimeError):
    """
    Lancé lorsqu'un email n'a pas pu être envoyé malgré une configuration valide.
    Encapsule les erreurs réseau ou SMTP survenues lors de la tentative d'envoi.
    """


def _env_flag(name: str, default: bool = False) -> bool:
    """
    Lit une variable d'environnement booléenne avec une valeur par défaut.

    Valeurs considérées comme True : '1', 'true', 'yes', 'on' (insensible à la casse).

    Args:
        name: Le nom de la variable d'environnement.
        default: La valeur par défaut si la variable n'est pas définie.

    Returns:
        La valeur booléenne de la variable d'environnement.
    """
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class EmailService:
    """
    Service SMTP pour l'envoi des messages du formulaire de contact.

    Lit sa configuration depuis les variables d'environnement au moment
    de l'instanciation. Supporte TLS (STARTTLS sur port 587) et SSL direct
    (port 465), mais pas les deux simultanément.
    """

    def __init__(self) -> None:
        """
        Initialise le service en lisant les variables d'environnement SMTP.

        Variables requises : MEDISCAN_SMTP_HOST, MEDISCAN_SMTP_USERNAME,
        MEDISCAN_SMTP_PASSWORD, MEDISCAN_CONTACT_FROM_EMAIL, MEDISCAN_CONTACT_TO_EMAIL.
        """
        self.host = os.getenv("MEDISCAN_SMTP_HOST", "").strip()
        self.port = int(os.getenv("MEDISCAN_SMTP_PORT", "587").strip())
        self.username = os.getenv("MEDISCAN_SMTP_USERNAME", "").strip()
        self.password = os.getenv("MEDISCAN_SMTP_PASSWORD", "").strip()
        self.from_email = os.getenv("MEDISCAN_CONTACT_FROM_EMAIL", "").strip()
        self.to_email = os.getenv("MEDISCAN_CONTACT_TO_EMAIL", "").strip()
        self.reply_to_email = os.getenv("MEDISCAN_CONTACT_REPLY_TO_EMAIL", "").strip() or self.from_email
        self.use_tls = _env_flag("MEDISCAN_SMTP_USE_TLS", default=True)
        self.use_ssl = _env_flag("MEDISCAN_SMTP_USE_SSL", default=False)

    def is_configured(self) -> bool:
        """
        Vérifie que toutes les variables d'environnement requises sont définies.

        Returns:
            True si le service est prêt à envoyer des emails, False sinon.
        """
        required = [
            self.host,
            self.username,
            self.password,
            self.from_email,
            self.to_email,
        ]
        return all(required)

    def validate(self) -> None:
        """
        Valide la configuration SMTP et lève une exception si elle est invalide.

        Raises:
            EmailConfigurationError: Si des variables d'environnement requises manquent,
                                      ou si TLS et SSL sont tous les deux activés.
        """
        if not self.is_configured():
            raise EmailConfigurationError(
                "Email service is not configured. Please set the MEDISCAN_SMTP_* and "
                "MEDISCAN_CONTACT_* environment variables."
            )

        if self.use_tls and self.use_ssl:
            raise EmailConfigurationError("SMTP TLS and SMTP SSL cannot both be enabled.")

    def send_contact_email(self, *, name: str, email: str, subject: str, message: str) -> None:
        """
        Envoie un email de contact formaté via le serveur SMTP configuré.

        Construit un email avec les informations de l'expéditeur (name, email),
        le sujet, et le corps du message. Ajoute l'adresse de l'utilisateur
        en Reply-To pour faciliter la réponse directe.

        Args:
            name: Le nom de la personne qui envoie le message.
            email: L'adresse email de la personne.
            subject: Le sujet du message de contact.
            message: Le corps du message de contact.

        Raises:
            EmailConfigurationError: Si la configuration SMTP est invalide.
            EmailDeliveryError: Si l'envoi de l'email échoue (erreur réseau ou SMTP).
        """
        self.validate()
        reply_to_addresses = [email]
        if self.reply_to_email and self.reply_to_email != email:
            reply_to_addresses.append(self.reply_to_email)

        mail = EmailMessage()
        mail["Subject"] = f"[MEDISCAN Contact] {subject}"
        mail["From"] = self.from_email
        mail["To"] = self.to_email
        mail["Reply-To"] = ", ".join(reply_to_addresses)

        content = "\n".join(
            [
                "New contact form submission",
                "",
                f"Name: {name}",
                f"Email: {email}",
                f"Subject: {subject}",
                "",
                "Message:",
                message,
            ]
        )
        mail.set_content(content)

        try:
            if self.use_ssl:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(self.host, self.port, context=context, timeout=20) as server:
                    server.login(self.username, self.password)
                    server.send_message(mail)
                return

            with smtplib.SMTP(self.host, self.port, timeout=20) as server:
                server.ehlo()
                if self.use_tls:
                    context = ssl.create_default_context()
                    server.starttls(context=context)
                    server.ehlo()
                server.login(self.username, self.password)
                server.send_message(mail)
        except (OSError, smtplib.SMTPException) as exc:
            raise EmailDeliveryError("Unable to send the contact email.") from exc
