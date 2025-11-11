# usuarios/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioViewSet, 
    ColaboradorViewSet,
    PerfisListView,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'colaboradores', ColaboradorViewSet, basename='colaborador')

urlpatterns = [
    path('', include(router.urls)),
    path('perfis/', PerfisListView.as_view(), name='perfis-list'),
]