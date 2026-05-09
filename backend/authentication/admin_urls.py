from django.urls import path
from . import views

# Admin-only endpoints — mounted at /api/admin/
urlpatterns = [
    path("users/",          views.user_list_view,   name="admin-user-list"),
    path("users/<int:pk>/", views.user_detail_view, name="admin-user-detail"),
]