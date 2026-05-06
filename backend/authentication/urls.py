from django.urls import path
from . import views

app_name = "authentication"

urlpatterns = [
    path("users/",          views.user_list_view,   name="admin-user-list"),
    path("users/<int:pk>/", views.user_detail_view, name="admin-user-detail"),
    path("profile/", views.profile_view, name="profile"),
]