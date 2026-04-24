from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class LoginSerializer(serializers.Serializer):
    """Serializer for user login credentials."""
    username = serializers.CharField(
        max_length=150,
        required=True,
        error_messages={'required': 'Username is required.', 'blank': 'Username cannot be blank.'}
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        error_messages={'required': 'Password is required.', 'blank': 'Password cannot be blank.'}
    )

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError(
                    'Invalid credentials. Access denied.',
                    code='authorization'
                )
            if not user.is_active:
                raise serializers.ValidationError(
                    'This account has been disabled.',
                    code='authorization'
                )
            data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for returning user data."""
    full_name = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'department']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_department(self, obj):
        try:
            return obj.profile.department
        except Exception:
            return None
