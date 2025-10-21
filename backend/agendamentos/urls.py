# agendamentos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HorarioTrabalhoViewSet,
    BloqueioAgendaViewSet,
    ModalidadeViewSet,
    AulaViewSet,
    AulaAlunoViewSet,
    ReposicaoViewSet,
    ListaEsperaViewSet
)

router = DefaultRouter()
router.register(r'horarios-trabalho', HorarioTrabalhoViewSet, basename='horariotrabalho')
router.register(r'bloqueios-agenda', BloqueioAgendaViewSet, basename='bloqueioagenda')
router.register(r'modalidades', ModalidadeViewSet, basename='modalidade')
router.register(r'aulas', AulaViewSet, basename='aula')
router.register(r'aulas-alunos', AulaAlunoViewSet, basename='aulaaluno')
router.register(r'reposicoes', ReposicaoViewSet, basename='reposicao')
router.register(r'listas-espera', ListaEsperaViewSet, basename='listaespera')

urlpatterns = [
    path('', include(router.urls)),
]