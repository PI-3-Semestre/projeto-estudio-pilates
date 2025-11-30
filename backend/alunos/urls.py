# alunos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlunoViewSet
from agendamentos.views import CreditoAulaViewSet
from rest_framework_nested import routers


router = DefaultRouter()

router.register(r"alunos", AlunoViewSet, basename="aluno") # Adicionado basename="aluno"


alunos_router_aninhado = routers.NestedDefaultRouter(router, r"alunos", lookup="aluno")

alunos_router_aninhado.register(
    r"creditos",
    CreditoAulaViewSet,
    basename="aluno-creditos", 
)


urlpatterns = [
    path("", include(router.urls)),
    path("", include(alunos_router_aninhado.urls)),
]
