from rest_framework import generics
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from .serializers import AvaliacaoSerializer
from .models import Avaliacao
from usuarios.models import Colaborador
from alunos.models import Aluno
from usuarios.permissions import CanManageAvaliations

@extend_schema(
    tags=['Avaliações'],
    description='''
Endpoint para Avaliações Físicas de um Aluno.

Fornece endpoints para:
- Listar todas as avaliações de um aluno específico (via `aluno_cpf` na URL).
- Criar uma nova avaliação para um aluno específico.

**Nota:** O acesso está restrito a `FISIOTERAPEUTA`, `INSTRUTOR` ou `ADMINISTRADOR`.
'''
)
class AvaliacaoListCreateView(generics.ListCreateAPIView):
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliations]

    def get_queryset(self):
        aluno_cpf = self.kwargs['aluno_cpf']
        return Avaliacao.objects.filter(aluno__cpf=aluno_cpf).order_by('-data_avaliacao')

    def perform_create(self, serializer):
        aluno_cpf = self.kwargs.get('aluno_cpf')
        aluno = get_object_or_404(Aluno, cpf=aluno_cpf)
        instrutor = get_object_or_404(Colaborador, usuario=self.request.user)
        serializer.save(aluno=aluno, instrutor=instrutor)


@extend_schema(
    tags=['Avaliações'],
    description='''Endpoint para gerenciar uma Avaliação Física específica diretamente pelo seu ID.'''
)
class AvaliacaoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para Detalhar/Atualizar/Deletar uma avaliação específica diretamente pelo seu ID.
    """
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliations]
    lookup_field = 'pk'