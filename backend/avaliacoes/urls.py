from django.urls import path
from . import views

urlpatterns = [
    path('alunos/<int:aluno_pk>/avaliacoes/', views.AvaliacaoListCreateView.as_view(), name='aluno-avaliacoes-list-create'),
    path('aluno/avalicao/<int:pk>/', views.AvaliacaoRetrieveUpdateDestroyView.as_view(), name='avaliacao-detail'),
]