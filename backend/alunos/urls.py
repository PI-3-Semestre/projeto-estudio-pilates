from django.urls import path
from . import views

urlpatterns = [
    path('alunos/', views.AlunoListCreateView.as_view(), name='aluno-list-create'),
    path('alunos/<int:pk>/', views.AlunoAtualizarDeletarView.as_view(), name='aluno-detail'),
    path('verificar-email/<uuid:token>/', views.verificar_email, name='verificar_email'),
]
