from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allows access only to admin (staff or superuser) accounts.
    Used in DJOSER['PERMISSIONS'] to restrict user listing/detail.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser)
        )


class IsAdminOrReadWrite(BasePermission):
    """
    - Any authenticated user : GET, POST, PUT, PATCH
    - Admin (staff/superuser): DELETE
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            return request.user.is_staff or request.user.is_superuser
        return True