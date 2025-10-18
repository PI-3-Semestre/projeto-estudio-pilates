from django.urls import path
from . import views

urlpatterns = [
    # Listar/Criar avaliações de um aluno específico via CPF
    path('alunos/<str:aluno_cpf>/avaliacoes/', views.AvaliacaoListCreateView.as_view(), name='aluno-avaliacoes-list-create'),
    
    # Acessar uma avaliação específica diretamente via ID da avaliação
    path('avaliacoes/<int:pk>/', views.AvaliacaoDetailView.as_view(), name='avaliacao-detail'),
]
