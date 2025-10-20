# agendamentos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HorarioTrabalhoViewSet, BloqueioAgendaViewSet, ModalidadeViewSet,
    AulaViewSet, AulaAlunoViewSet, ReposicaoViewSet, ListaEsperaViewSet
)

# Cria um router e registra nossos viewsets com ele.
router = DefaultRouter()
router.register(r'horarios-trabalho', HorarioTrabalhoViewSet)
router.register(r'bloqueios-agenda', BloqueioAgendaViewSet)
router.register(r'modalidades', ModalidadeViewSet)
router.register(r'aulas', AulaViewSet)
router.register(r'agendamentos-alunos', AulaAlunoViewSet)
router.register(r'reposicoes', ReposicaoViewSet)
router.register(r'listas-espera', ListaEsperaViewSet)

# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]
