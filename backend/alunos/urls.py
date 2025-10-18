# alunos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlunoViewSet

# O DefaultRouter gera automaticamente as URLs para um ViewSet.
router = DefaultRouter()

# Registra o AlunoViewSet com o prefixo de URL 'alunos'.
# Isso cria as seguintes rotas:
# - /alunos/ (GET para listar, POST para criar)
# - /alunos/{cpf}/ (GET para detalhar, PUT/PATCH para atualizar, DELETE para remover)
router.register(r'alunos', AlunoViewSet)

# Inclui as URLs geradas pelo router no padrão de URLs do aplicativo.
urlpatterns = [
    path('', include(router.urls)),
]
