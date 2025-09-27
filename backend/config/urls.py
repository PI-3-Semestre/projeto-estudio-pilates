# backend/config/urls.py

from django.contrib import admin
from django.urls import path, include  # <-- Certifique-se de que 'include' está importado

urlpatterns = [
    path("admin/", admin.site.urls),
    # Adicione esta linha abaixo
    path("api/auth/", include("usuarios.urls")), 
]