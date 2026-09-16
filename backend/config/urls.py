"""URL configuration for the carkingdom backend.

The API lives under /api/. During development the Vite dev server proxies
/api here (see frontend/vite.config.js), so the frontend can call bare /api/...
paths with no base URL to configure.
"""
from django.contrib import admin
from django.urls import path

from api.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),
]
