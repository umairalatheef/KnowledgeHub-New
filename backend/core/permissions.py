from rest_framework.permissions import BasePermission

class IsAdminOrStaff(BasePermission):
    """
    Allows access to users with user_type='admin' or is_staff=True.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.user_type == 'admin' or request.user.is_staff
        )

class IsRegularUser(BasePermission):
    """
    Allows access to users with user_type='student'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'student'
