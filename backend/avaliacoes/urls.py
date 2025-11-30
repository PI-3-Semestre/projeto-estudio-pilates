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

    path('alunos/<str:aluno_cpf>/avaliacoes/', views.AvaliacaoListCreateView.as_view(), name='aluno-avaliacoes-list-create'),
    
    path('alunos/<str:aluno_cpf>/avaliacoes/latest/', views.LatestAvaliacaoView.as_view(), name='aluno-latest-avaliacao'),

    path('avaliacoes/<int:pk>/', views.AvaliacaoDetailView.as_view(), name='avaliacao-detail'),
]
