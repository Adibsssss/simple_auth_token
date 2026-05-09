from django.contrib import admin
from .models import UserProfile, EmailLog

@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display  = ['subject', 'to_email', 'sent_by', 'sent_at', 'success']
    list_filter   = ['success', 'sent_at']
    search_fields = ['to_email', 'subject', 'sent_by__username']
    readonly_fields = ['sent_by', 'to_email', 'subject', 'message', 'sent_at', 'success', 'error_info']
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'created_at', 'last_login_ip']
    search_fields = ['user__username', 'user__email', 'department']
    list_filter = ['department', 'created_at']
