from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import User

from .serializers import LoginSerializer, UserSerializer
from .models import UserProfile


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Authenticate user and return a token using Django Simple Token Auth.
    """
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {
                'success': False,
                'message': 'Invalid credentials. You do not have access.',
                'errors': serializer.errors,
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    user = serializer.validated_data['user']

    # Update last login IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    try:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.last_login_ip = ip
        profile.save()
    except Exception:
        pass

    # Get or create token (Django Simple Token Authentication)
    token, created = Token.objects.get_or_create(user=user)

    user_data = UserSerializer(user).data

    return Response(
        {
            'success': True,
            'message': 'Login successful.',
            'token': token.key,
            'user': user_data,
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/auth/logout/
    Delete user token (logout).
    """
    try:
        request.user.auth_token.delete()
    except Exception:
        pass

    return Response(
        {'success': True, 'message': 'Logged out successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET /api/auth/profile/
    Return authenticated user's profile data.
    """
    serializer = UserSerializer(request.user)
    return Response(
        {'success': True, 'user': serializer.data},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
    """
    GET /api/auth/verify/
    Verify if a token is still valid.
    """
    return Response(
        {'success': True, 'valid': True, 'user': UserSerializer(request.user).data},
        status=status.HTTP_200_OK
    )
