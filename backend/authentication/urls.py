from django.urls import path
from . import views
from .email_views import send_email_view

app_name = "authentication"

urlpatterns = [
    path("users/",          views.user_list_view,   name="admin-user-list"),
    path("users/<int:pk>/", views.user_detail_view, name="admin-user-detail"),
    path("profile/",        views.profile_view,     name="profile"),
    path("send-email/",     send_email_view,        name="send-email"),
    path("login/",          views.custom_login_view, name="custom-login"),
]