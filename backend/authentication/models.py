from django.db import models
from django.contrib.auth.models import AbstractUser


class UserProfile(models.Model):
    """Extended user profile linked to Django's built-in User model."""
    user = models.OneToOneField(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='profile'
    )
    department = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username}'s Profile"

class EmailLog(models.Model):
    """Stores a record of every email sent through the API."""
    sent_by    = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    to_email   = models.EmailField()
    subject    = models.CharField(max_length=255)
    message    = models.TextField()
    sent_at    = models.DateTimeField(auto_now_add=True)
    success    = models.BooleanField(default=True)
    error_info = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'email_logs'
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.subject} → {self.to_email} ({self.sent_at:%Y-%m-%d %H:%M})"
