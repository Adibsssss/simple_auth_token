from rest_framework.permissions import BasePermission


class IsAdminOrReadWrite(BasePermission):
    """
    - Any authenticated user : GET, POST, PUT, PATCH
    - Admin (staff/superuser): DELETE
    """
    def has_permission(self, request, view):
        # Must be authenticated for all actions
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        # DELETE is restricted to admin only
        if request.method == 'DELETE':
            return request.user.is_staff or request.user.is_superuser
        return True
