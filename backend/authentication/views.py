from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailLog

import logging

from .permissions import IsAdminUser
from .serializers import (
    UserSerializer,
    AdminCreateUserSerializer,
    AdminUpdateUserSerializer,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
#  GET /api/auth/profile/   → works for ALL authenticated users
#  This replaces Djoser /users/me/ which has permission issues
# ─────────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    return Response(
        UserSerializer(request.user).data,
        status=status.HTTP_200_OK
    )


# ─────────────────────────────────────────────────────────────
#  GET    /api/admin/users/         → list all users (admin)
#  POST   /api/admin/users/         → create user   (admin)
# ─────────────────────────────────────────────────────────────
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_list_view(request):

    if request.method == "GET":
        users = User.objects.filter(is_superuser=False).order_by("-date_joined")
        return Response({
            "success": True,
            "count": users.count(),
            "users": UserSerializer(users, many=True).data,
        }, status=status.HTTP_200_OK)

    if request.method == "POST":
        serializer = AdminCreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            Token.objects.get_or_create(user=user)
            return Response({
                "success": True,
                "message": "User created successfully.",
                "user": UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)

        return Response({
            "success": False,
            "message": "Validation failed.",
            "errors": serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
#  GET    /api/admin/users/<id>/    → retrieve user  (admin)
#  PATCH  /api/admin/users/<id>/    → update user    (admin)
#  DELETE /api/admin/users/<id>/    → delete user    (admin)
# ─────────────────────────────────────────────────────────────
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_detail_view(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({
            "success": False,
            "message": "User not found.",
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response({
            "success": True,
            "user": UserSerializer(user).data,
        }, status=status.HTTP_200_OK)

    if request.method == "PATCH":
        serializer = AdminUpdateUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "User updated successfully.",
                "user": UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
        return Response({
            "success": False,
            "message": "Validation failed.",
            "errors": serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if user.is_superuser:
            return Response({
                "success": False,
                "message": "Cannot delete a superuser account.",
            }, status=status.HTTP_400_BAD_REQUEST)
        username = user.username
        user.delete()
        return Response({
            "success": True,
            "message": f'User "{username}" deleted successfully.',
        }, status=status.HTTP_200_OK)
    
@api_view(["POST"])
@permission_classes([])  # no auth required — this IS the login
def custom_login_view(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "").strip()

    if not username or not password:
        return Response(
            {"success": False, "message": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {"success": False, "message": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)

    # ── Send login notification email ──────────────────────────
    if user.email:
        subject = "New Login to Nexus Portal"
        message = (
            f"Hi {user.get_full_name() or user.username},\n\n"
            f"A new login was detected on your Nexus Portal account.\n\n"
            f"Username: {user.username}\n"
            f"If this wasn't you, please contact your administrator immediately.\n\n"
            f"— Nexus Portal"
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,  # don't block login if email fails
            )
            EmailLog.objects.create(
                sent_by=user,
                to_email=user.email,
                subject=subject,
                message=message,
                success=True,
            )
        except Exception as exc:
            EmailLog.objects.create(
                sent_by=user,
                to_email=user.email,
                subject=subject,
                message=message,
                success=False,
                error_info=str(exc),
            )

    return Response(
        {
            "success": True,
            "token": token.key,
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )