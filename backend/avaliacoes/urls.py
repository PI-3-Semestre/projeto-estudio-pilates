from django.urls import path
from . import views

# Define os padrões de URL para o aplicativo de avaliações.
urlpatterns = [
    # Rota para o aluno logado ver suas próprias avaliações
    path('me/', views.MinhasAvaliacoesListView.as_view(), name='minhas-avaliacoes-list'),

    # Rota para listar todas as avaliações (GET) ou criar uma nova (POST)
    path('', views.AvaliacaoGlobalListCreateView.as_view(), name='avaliacao-global-list-create'),

    # Rota para listar o histórico de avaliações de um aluno pelo ID
    path('alunos/<int:aluno_id>/', views.AvaliacaoListByAlunoIdView.as_view(), name='aluno-id-avaliacoes-list'),

    # Rota para listar o histórico de avaliações de um aluno ou criar uma nova.
    # Acessível via GET (listar) e POST (criar).
    # Ex: /api/alunos/12345678901/avaliacoes/
    path('alunos/<str:aluno_cpf>/avaliacoes/', views.AvaliacaoListCreateView.as_view(), name='aluno-avaliacoes-list-create'),
    
    # Rota para gerenciar a avaliação mais recente de um aluno.
    # Acessível via GET (detalhar), PUT (atualizar), PATCH (atualização parcial) e DELETE (deletar).
    # Ex: /api/alunos/12345678901/avaliacoes/latest/
    path('alunos/<str:aluno_cpf>/avaliacoes/latest/', views.LatestAvaliacaoView.as_view(), name='aluno-latest-avaliacao'),

    # Rota para gerenciar uma avaliação específica pelo seu ID único.
    # Acessível via GET (detalhar), PUT (atualizar), PATCH (atualização parcial) e DELETE (deletar).
    # Ex: /api/avaliacoes/1/
    path('avaliacoes/<int:pk>/', views.AvaliacaoDetailView.as_view(), name='avaliacao-detail'),
]
