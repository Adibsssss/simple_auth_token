from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'created_at', 'last_login_ip']
    search_fields = ['user__username', 'user__email', 'department']
    list_filter = ['department', 'created_at']
