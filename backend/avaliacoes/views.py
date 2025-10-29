from rest_framework import generics
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from .serializers import AvaliacaoSerializer
from .models import Avaliacao
from usuarios.models import Colaborador
from alunos.models import Aluno
from .permissions import CanManageAvaliacaoObject
from django.http import Http404

@extend_schema(
    summary='Lista e cria avaliações para um aluno',
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
    permission_classes = [CanManageAvaliacaoObject]

    def get_queryset(self):
        aluno_cpf = self.kwargs['aluno_cpf']
        user = self.request.user

        is_owner = hasattr(user, 'cpf') and user.cpf == aluno_cpf
        is_privileged = False
        if user.is_authenticated:
            if user.is_superuser:
                is_privileged = True
            else:
                try:
                    user_perfis = set(user.colaborador.perfis.values_list('nome', flat=True))
                    if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'FISIOTERAPEUTA', 'INSTRUTOR', 'RECEPCIONISTA'] for perfil in user_perfis):
                        is_privileged = True
                except Colaborador.DoesNotExist:
                    pass

        if not (is_owner or is_privileged):
            return Avaliacao.objects.none()

        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)
        return Avaliacao.objects.filter(aluno=aluno).order_by('-data_avaliacao')

    def perform_create(self, serializer):
        aluno_cpf = self.kwargs.get('aluno_cpf')
        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)
        instrutor = get_object_or_404(Colaborador, usuario=self.request.user)
        serializer.save(aluno=aluno, instrutor=instrutor)


@extend_schema(
    summary='Busca, atualiza e deleta uma avaliação pelo ID',
    tags=['Avaliações'],
    description='''Endpoint para gerenciar uma Avaliação Física específica diretamente pelo seu ID.'''
)
class AvaliacaoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliacaoObject]
    lookup_field = 'pk'


@extend_schema(
    summary='Busca, atualiza e deleta a avaliação mais recente de um aluno',
    tags=['Avaliações'],
    description='''Endpoint para gerenciar a Avaliação Física mais recente de um Aluno (via CPF).'''
)
class LatestAvaliacaoView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliacaoObject]

    def get_object(self):
        aluno_cpf = self.kwargs['aluno_cpf']
        user = self.request.user

        is_owner = hasattr(user, 'cpf') and user.cpf == aluno_cpf
        is_privileged = False
        if user.is_authenticated:
            if user.is_superuser:
                is_privileged = True
            else:
                try:
                    user_perfis = set(user.colaborador.perfis.values_list('nome', flat=True))
                    if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'FISIOTERAPEUTA', 'INSTRUTOR', 'RECEPCIONISTA'] for perfil in user_perfis):
                        is_privileged = True
                except Colaborador.DoesNotExist:
                    pass

        if not (is_owner or is_privileged):
            raise Http404("Nenhuma avaliação encontrada para este aluno.")

        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)
        avaliacao = Avaliacao.objects.filter(aluno=aluno).order_by('-data_avaliacao').first()

        if not avaliacao:
            raise Http404("Nenhuma avaliação encontrada para este aluno.")

        self.check_object_permissions(self.request, avaliacao)
        return avaliacao
