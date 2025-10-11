from django.urls import path
from . import views

urlpatterns = [
    path('alunos/<int:aluno_pk>/avaliacoes/', views.AvaliacaoCreateView.as_view())
]