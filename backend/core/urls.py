from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.authtoken')),

    # ── Custom admin-only user management ─────────────────────────────────────
    path('api/admin/', include('authentication.urls')),

    # ── Items ──────────────────────────────────────────────────────────────────
    path('api/items/', include('items.urls')),
]