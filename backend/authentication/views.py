from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
)


# ─────────────────────────────────────────
#  POST /api/auth/register/   (public)
# ─────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'message': 'Account created successfully.',
            'token': token.key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

    return Response({
        'success': False,
        'message': 'Registration failed.',
        'errors': serializer.errors,
    }, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────
#  POST /api/auth/login/      (public)
# ─────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user  = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'message': 'Login successful.',
            'token': token.key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)

    return Response({
        'success': False,
        'message': 'Invalid credentials. You do not have access.',
        'errors': serializer.errors,
    }, status=status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────
#  POST /api/auth/logout/     (authenticated)
# ─────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({
        'success': True,
        'message': 'Logged out successfully.',
    }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────
#  GET   /api/auth/profile/   → view own profile
#  PATCH /api/auth/profile/   → update own profile
# ─────────────────────────────────────────
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):

    if request.method == 'GET':
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data,
        }, status=status.HTTP_200_OK)

    if request.method == 'PATCH':
        serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully.',
                'user': UserSerializer(request.user).data,
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Update failed.',
            'errors': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────
#  POST /api/auth/change-password/  (authenticated)
# ─────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'success': False,
                'message': 'Old password is incorrect.',
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        # Refresh token after password change
        user.auth_token.delete()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'message': 'Password changed successfully.',
            'token': token.key,
        }, status=status.HTTP_200_OK)

    return Response({
        'success': False,
        'message': 'Validation failed.',
        'errors': serializer.errors,
    }, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────
#  GET    /api/auth/users/         → list all users   (admin only)
#  DELETE /api/auth/users/<id>/    → delete a user    (admin only)
# ─────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list_view(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({
            'success': False,
            'message': 'Permission denied. Admins only.',
        }, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.filter(is_superuser=False).order_by('-date_joined')
    return Response({
        'success': True,
        'count': users.count(),
        'users': UserSerializer(users, many=True).data,
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail_view(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({
            'success': False,
            'message': 'Permission denied. Admins only.',
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found.',
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)

    if request.method == 'DELETE':
        if user.is_superuser:
            return Response({
                'success': False,
                'message': 'Cannot delete a superuser account.',
            }, status=status.HTTP_400_BAD_REQUEST)
        username = user.username
        user.delete()
        return Response({
            'success': True,
            'message': f'User "{username}" deleted successfully.',
        }, status=status.HTTP_200_OK)
