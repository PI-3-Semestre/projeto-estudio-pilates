# usuarios/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, ColaboradorViewSet

# Cria um router e registra nossos viewsets com ele.
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'colaboradores', ColaboradorViewSet)

# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]