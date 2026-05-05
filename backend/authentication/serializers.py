from rest_framework import serializers
from django.contrib.auth.models import User
from djoser.serializers import UserCreateSerializer


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer used by Djoser for /users/me/ and /users/{id}/.
    Also used by our custom admin endpoints.
    """
    full_name  = serializers.SerializerMethodField()
    is_admin   = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_admin', 'department', 'date_joined', 'is_active',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser

    def get_department(self, obj):
        try:
            return obj.profile.department
        except Exception:
            return None


class RegisterSerializer(UserCreateSerializer):
    """
    Extends Djoser's UserCreateSerializer to accept
    first_name and last_name at sign-up.
    """
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name  = serializers.CharField(required=False, allow_blank=True)

    class Meta(UserCreateSerializer.Meta):
        model  = User
        fields = [
            'username', 'email',
            'first_name', 'last_name',
            'password',
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already in use.')
        return value


class UpdateUserSerializer(serializers.ModelSerializer):
    """For updating a user's own profile (used by our custom endpoint)."""
    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name']

    def validate_email(self, value):
        user = self.instance
        if value and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('Email already in use.')
        return value


class AdminCreateUserSerializer(serializers.ModelSerializer):
    """Admin-only: create a new user with optional staff flag."""
    password   = serializers.CharField(write_only=True, min_length=6)
    department = serializers.CharField(max_length=100, required=False, allow_blank=True)
    is_admin   = serializers.BooleanField(default=False)

    class Meta:
        model  = User
        fields = ['username', 'email', 'first_name', 'last_name',
                  'password', 'department', 'is_admin']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already in use.')
        return value

    def create(self, validated_data):
        department = validated_data.pop('department', None)
        is_admin   = validated_data.pop('is_admin', False)
        password   = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.is_staff = is_admin
        user.save()

        from authentication.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if department:
            profile.department = department
            profile.save()

        return user


class AdminUpdateUserSerializer(serializers.ModelSerializer):
    """Admin-only: update any user's details."""
    department = serializers.CharField(max_length=100, required=False, allow_blank=True)
    is_admin   = serializers.BooleanField(required=False)

    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name', 'is_active', 'department', 'is_admin']

    def validate_email(self, value):
        user = self.instance
        if value and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('Email already in use.')
        return value

    def update(self, instance, validated_data):
        department = validated_data.pop('department', None)
        is_admin   = validated_data.pop('is_admin', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if is_admin is not None:
            instance.is_staff = is_admin

        instance.save()

        if department is not None:
            from authentication.models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.department = department
            profile.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """For changing own password via custom endpoint (alternative to Djoser's)."""
    old_password  = serializers.CharField(write_only=True)
    new_password  = serializers.CharField(write_only=True, min_length=6)
    new_password2 = serializers.CharField(write_only=True, label='Confirm new password')

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({'new_password2': 'Passwords do not match.'})
        return data