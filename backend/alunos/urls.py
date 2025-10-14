# alunos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlunoViewSet

# Cria um router e registra nosso viewset com ele.
router = DefaultRouter()
router.register(r'alunos', AlunoViewSet)

# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]