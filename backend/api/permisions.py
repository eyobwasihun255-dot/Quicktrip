from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request,view):
        return getattr(request.user, 'user_type', None) == 'a'
    

class IsSub(BasePermission):
    def has_permission(self, request, view):
        # Admin should be able to do everything a sub-admin can do
        return getattr(request.user, 'user_type', None) in ('s', 'a')
    
class IsBranch(BasePermission):
     
     def has_object_permission(self, request, view, obj):
        # Admin bypasses branch scoping
        if getattr(request.user, 'user_type', None) == 'a':
            return True
        return getattr(request.user, 'branch', None) == getattr(obj, 'branch', None)

class IsAdminOrSub(BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, 'user_type', None) in ('a', 's')
