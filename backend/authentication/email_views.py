"""
Email functionality for Nexus Portal.
Provides a REST endpoint for sending emails via Django's SMTP backend.
All sent emails (successful or failed) are saved to the EmailLog model,
which is visible in the Django admin panel.
"""

import logging
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import SendEmailSerializer
from .models import EmailLog

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
#  POST /api/auth/send-email/
#  Requires: Token authentication
#  Body: { "to_email": "...", "subject": "...", "message": "..." }
# ─────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_email_view(request):
    """
    Send an email via SMTP.

    Request body (JSON):
        to_email  (str, required) — recipient address
        subject   (str, required) — email subject line
        message   (str, required) — plain-text email body

    Returns:
        200 OK on success with confirmation details
        400 Bad Request on validation or header injection error
        500 Internal Server Error on SMTP/network failure

    Every attempt (success or failure) is saved to the EmailLog table,
    visible under Authentication > Email Logs in the Django admin panel.
    """
    serializer = SendEmailSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {
                "success": False,
                "message": "Validation failed.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    to_email   = serializer.validated_data["to_email"]
    subject    = serializer.validated_data["subject"]
    message    = serializer.validated_data["message"]
    from_email = settings.DEFAULT_FROM_EMAIL

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[to_email],
            fail_silently=False,
        )

        # ── Save a success log ──────────────────────────────────
        EmailLog.objects.create(
            sent_by=request.user,
            to_email=to_email,
            subject=subject,
            message=message,
            success=True,
        )

        logger.info(
            "Email sent successfully to %s by user %s",
            to_email,
            request.user.username,
        )
        return Response(
            {
                "success": True,
                "message": f"Email successfully sent to {to_email}.",
                "details": {
                    "from":     from_email,
                    "to":       to_email,
                    "subject":  subject,
                    "sent_by":  request.user.username,
                },
            },
            status=status.HTTP_200_OK,
        )

    except BadHeaderError:
        # Header injection attempt detected by Django
        error_msg = "Invalid header value detected (possible header injection)."

        EmailLog.objects.create(
            sent_by=request.user,
            to_email=to_email,
            subject=subject,
            message=message,
            success=False,
            error_info=error_msg,
        )

        logger.warning(
            "BadHeaderError: possible header injection attempt by user %s targeting %s",
            request.user.username,
            to_email,
        )
        return Response(
            {
                "success":    False,
                "message":    "Invalid header value detected. Email not sent.",
                "error_type": "BadHeaderError",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as exc:  # noqa: BLE001
        # Catches SMTPAuthenticationError, SMTPConnectError, SMTPException, etc.
        error_msg = f"{type(exc).__name__}: {exc}"

        EmailLog.objects.create(
            sent_by=request.user,
            to_email=to_email,
            subject=subject,
            message=message,
            success=False,
            error_info=error_msg,
        )

        logger.error(
            "Failed to send email to %s: %s",
            to_email,
            error_msg,
        )
        return Response(
            {
                "success":      False,
                "message":      "Email delivery failed. See server logs for details.",
                "error_type":   type(exc).__name__,
                "error_detail": str(exc),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )