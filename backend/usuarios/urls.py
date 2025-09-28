from django.urls import path
from . import views


urlpatterns = [
    path('alunos/', views.lista_alunos, name='lista_alunos'),
    path('cadastrar/', views.cadastrar_aluno, name='cadastrar_aluno'),
    path('editar/<int:pk>/', views.editar_aluno, name='editar_aluno'),
    path('excluir/<int:pk>/', views.excluir_aluno, name='excluir_aluno'),
     path('verificar-email/<uuid:token>/', views.verificar_email, name='verificar_email'),
     
    path('alunos/<int:aluno_pk>/avaliacoes/', views.AvaliacaoInicialCreateView.as_view())
]
