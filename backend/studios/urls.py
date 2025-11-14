# studios/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudioViewSet, DashboardStudioView

# O DefaultRouter é uma ferramenta do Django Rest Framework que cria automaticamente
# um conjunto completo de URLs para um ViewSet.
router = DefaultRouter()

# Registra o StudioViewSet com o router.
# O prefixo da URL será 'studios/' (definido no urls.py principal do projeto).
# O `basename` é usado para nomear as URLs geradas, o que é útil para reverter URLs.
router.register(r'', StudioViewSet, basename='studio')

# Inclui as URLs geradas pelo router no padrão de URLs do aplicativo.
urlpatterns = [
    path('', include(router.urls)),
    path('<int:studio_pk>/dashboard/', DashboardStudioView.as_view(), name='studio-dashboard'),
]
