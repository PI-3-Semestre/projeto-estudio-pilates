from django.urls import path
from . import views

urlpatterns = [
    # GET, POST -> /api/alunos/<int:aluno_pk>/avaliacoes/
    path('alunos/<int:aluno_pk>/avaliacoes/', views.AvaliacaoListCreateView.as_view(), name='aluno-avaliacoes-list-create'),
    
    # GET, PUT, PATCH, DELETE -> /api/avaliacoes/<int:pk>/
    path('<int:pk>/aluno', views.AvaliacaoRetrieveUpdateDestroyView.as_view(), name='avaliacao-detail'),
]