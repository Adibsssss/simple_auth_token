from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Djoser: register, login, logout, password change, /users/me/
    path("api/auth/", include("djoser.urls")),
    path("api/auth/", include("djoser.urls.authtoken")),

    # Custom profile endpoint — works for ALL users
    path("api/auth/", include("authentication.urls")),

    # Admin-only user management — separate prefix avoids Djoser conflict
    path("api/admin/", include("authentication.admin_urls")),

    # Items
    path("api/items/", include("items.urls")),
]