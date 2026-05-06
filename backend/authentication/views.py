from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
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