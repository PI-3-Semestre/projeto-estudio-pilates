# agendamentos/urls.py
from django.urls import path
from .views import (
    HorarioTrabalhoListCreateView,
    HorarioTrabalhoRetrieveUpdateDestroyAPIView, 
    BloqueioAgendaListCreateView,
    BloqueioAgendaRetrieveUpdateDestroyAPIView,   
    ModalidadeListCreateView,
    ModalidadeRetrieveUpdateDestroyAPIView,    
    AulaListCreateView,
    AulaRetrieveUpdateDestroyAPIView,       
    AgendamentoAlunoListCreateView,
    AgendamentoAlunoRetrieveUpdateDestroyAPIView, 
    ReposicaoListCreateView,
    ReposicaoRetrieveUpdateDestroyAPIView,    
    ListaEsperaListCreateView,
    ListaEsperaRetrieveUpdateDestroyAPIView     
)

urlpatterns = [
    # Horarios de Trabalho
    path('horarios/trabalho/', HorarioTrabalhoListCreateView.as_view(), name='horario-trabalho-list-create'),
    path('horarios/trabalho/<int:pk>/', HorarioTrabalhoRetrieveUpdateDestroyAPIView.as_view(), name='horario-trabalho-detail'),
    
    # Bloqueios de Agenda
    path('bloqueios/agenda/', BloqueioAgendaListCreateView.as_view(), name='bloqueio-agenda-list-create'),
    path('bloqueios/agenda/<int:pk>/', BloqueioAgendaRetrieveUpdateDestroyAPIView.as_view(), name='bloqueio-agenda-detail'),

    # Modalidades
    path('modalidades/', ModalidadeListCreateView.as_view(), name='modalidade-list-create'),
    path('modalidades/<int:pk>/', ModalidadeRetrieveUpdateDestroyAPIView.as_view(), name='modalidade-detail'),

    # Aulas
    path('aulas/', AulaListCreateView.as_view(), name='aula-list-create'),
    path('aulas/<int:pk>/', AulaRetrieveUpdateDestroyAPIView.as_view(), name='aula-detail'),

    # Agendamentos (AulaAluno)
    path('aulas-alunos/', AgendamentoAlunoListCreateView.as_view(), name='agendamento-aluno-list-create'),
    path('aulas-alunos/<int:pk>/', AgendamentoAlunoRetrieveUpdateDestroyAPIView.as_view(), name='agendamento-aluno-detail'),

    # Reposições
    path('reposicoes/', ReposicaoListCreateView.as_view(), name='reposicao-list-create'),
    path('reposicoes/<int:pk>/', ReposicaoRetrieveUpdateDestroyAPIView.as_view(), name='reposicao-detail'),

    # Listas de Espera
    path('listas-espera/', ListaEsperaListCreateView.as_view(), name='lista-espera-list-create'),
    path('listas-espera/<int:pk>/', ListaEsperaRetrieveUpdateDestroyAPIView.as_view(), name='lista-espera-detail'),
]