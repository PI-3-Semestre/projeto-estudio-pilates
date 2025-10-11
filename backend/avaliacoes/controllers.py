from django.shortcuts import get_object_or_404 
from usuarios.models import Aluno


def crtler_criar_avalicao_aluno(serializer, aluno_pk):
    aluno = get_object_or_404(Aluno, pk=aluno_pk)
    serializer.save(aluno=aluno)