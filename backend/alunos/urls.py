# alunos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlunoViewSet
from agendamentos.views import CreditoAulaViewSet
from rest_framework_nested import routers

# O DefaultRouter gera automaticamente as URLs para um ViewSet.
router = DefaultRouter()

# Registra o AlunoViewSet com o prefixo de URL 'alunos'.
# Isso cria as seguintes rotas:
# - /alunos/ (GET para listar, POST para criar)
# - /alunos/{cpf}/ (GET para detalhar, PUT/PATCH para atualizar, DELETE para remover)
router.register(r"alunos", AlunoViewSet)

# Inclui as URLs geradas pelo router no padrão de URLs do aplicativo.

alunos_router_aninhado = routers.NestedDefaultRouter(router, r"alunos", lookup="aluno")

alunos_router_aninhado.register(
    r"creditos",
    CreditoAulaViewSet,
    basename="aluno-creditos",  # 'basename' é obrigatório
)


urlpatterns = [
    path("", include(router.urls)),
    path("", include(alunos_router_aninhado.urls)),
]
