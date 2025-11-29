from rest_framework import generics
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from .serializers import AvaliacaoSerializer, AvaliacaoCreateSerializer
from .models import Avaliacao
from usuarios.models import Colaborador
from alunos.models import Aluno
from .permissions import CanManageAvaliacaoObject, IsAluno
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from core.permissions import HasRole

@extend_schema(
    tags=['Avaliações (Aluno)'],
    description='''Endpoint para o aluno logado visualizar seu próprio histórico de avaliações.'''
)
class MinhasAvaliacoesListView(generics.ListAPIView):
    """
    View para o aluno logado listar seu próprio histórico de avaliações.
    """
    serializer_class = AvaliacaoSerializer
    permission_classes = [IsAuthenticated, IsAluno]

    def get_queryset(self):
        """
        Retorna as avaliações do aluno logado, ordenadas da mais recente para a mais antiga.
        """
        aluno = self.request.user.aluno
        return Avaliacao.objects.filter(aluno=aluno).select_related(
            'aluno__usuario', 
            'instrutor__usuario'
        ).order_by('-data_avaliacao')

@extend_schema(
    tags=['Avaliações'],
    description='''
Endpoint para listar todas as avaliações físicas do sistema ou criar uma nova.

- **GET:** Lista todas as avaliações (acesso restrito a `ADMIN_MASTER` ou `ADMINISTRADOR`).
- **POST:** Cria uma nova avaliação (acesso restrito a `FISIOTERAPEUTA`, `INSTRutor` ou `ADMINISTRADOR`).
'''
)
class AvaliacaoGlobalListCreateView(generics.ListCreateAPIView):
    """
    View para listar todas as avaliações (GET) ou criar uma nova (POST).
    """
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AvaliacaoCreateSerializer
        return AvaliacaoSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'FISIOTERAPEUTA', 'INSTRUTOR'])]
        return [IsAuthenticated(), HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]

    def get_queryset(self):
        return Avaliacao.objects.select_related(
            'aluno__usuario', 
            'instrutor__usuario'
        ).order_by('-data_avaliacao')

    def perform_create(self, serializer):
        instrutor = get_object_or_404(Colaborador, usuario=self.request.user)
        
        num_studios = instrutor.unidades.count()
        
        if num_studios == 0:
            raise PermissionDenied("Você não está associado a nenhum studio para criar uma avaliação.")
        
        if num_studios > 1:
            raise ValidationError({
                "detail": "Você está associado a múltiplos studios. Não é possível determinar o studio automaticamente."
            })
            
        studio = instrutor.unidades.first()
        
        serializer.save(instrutor=instrutor, studio=studio)


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
    """
    View para listar o histórico de avaliações de um aluno (GET) ou criar uma nova (POST).
    Filtra as avaliações pelo CPF do aluno fornecido na URL.
    """
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliacaoObject]

    def get_queryset(self):
        """Retorna as avaliações do aluno especificado na URL, ordenadas da mais recente para a mais antiga."""
        aluno_cpf = self.kwargs['aluno_cpf']
        return Avaliacao.objects.filter(aluno__usuario__cpf=aluno_cpf).order_by('-data_avaliacao')

    def perform_create(self, serializer):
        """Associa o aluno, o instrutor (usuário logado) e o estúdio automaticamente ao criar uma nova avaliação."""
        aluno_cpf = self.kwargs.get('aluno_cpf')
        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)
        instrutor = get_object_or_404(Colaborador, usuario=self.request.user)

        studio = None
        if aluno.unidades.count() == 1:
            studio = aluno.unidades.first()
        
        if not studio and 'studio' in serializer.validated_data:
            studio = serializer.validated_data['studio']
        
        if not studio and instrutor.unidades.count() == 1:
            studio = instrutor.unidades.first()
        
        serializer.save(aluno=aluno, instrutor=instrutor, studio=studio)


@extend_schema(
    tags=['Avaliações'],
    description='''Endpoint para gerenciar uma Avaliação Física específica diretamente pelo seu ID.'''
)
class AvaliacaoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para detalhar, atualizar ou deletar uma avaliação específica pelo seu ID.
    Permite operações de GET, PUT, PATCH e DELETE.
    """
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliacaoObject]
    lookup_field = 'pk'


@extend_schema(
    tags=['Avaliações'],
    description='''Endpoint para gerenciar a Avaliação Física mais recente de um Aluno (via CPF).'''
)
class LatestAvaliacaoView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para gerenciar a avaliação mais recente de um aluno.
    Permite operações de GET, PUT, PATCH e DELETE na última avaliação do aluno, 
    identificado pelo CPF na URL.
    """
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliacaoObject]

    def get_object(self):
        """Encontra e retorna a avaliação mais recente do aluno especificado na URL."""
        aluno_cpf = self.kwargs['aluno_cpf']
        avaliacao = Avaliacao.objects.filter(aluno__usuario__cpf=aluno_cpf).order_by('-data_avaliacao').first()
        
        if not avaliacao:
            raise Http404("Nenhuma avaliação encontrada para este aluno.")
        
        self.check_object_permissions(self.request, avaliacao)
        
        return avaliacao

@extend_schema(
    tags=['Avaliações'],
    description='''
Endpoint para listar o histórico de avaliações de um aluno pelo seu ID numérico.

**Nota:** O acesso está restrito a `FISIOTERAPEUTA`, `INSTRUTOR` ou `ADMINISTRADOR`.
'''
)
class AvaliacaoListByAlunoIdView(generics.ListAPIView):
    """
    View para listar o histórico de avaliações de um aluno, filtrando pelo ID do aluno.
    """
    serializer_class = AvaliacaoSerializer
    permission_classes = [CanManageAvaliacaoObject]

    def get_queryset(self):
        """
        Retorna as avaliações do aluno especificado na URL pelo seu ID,
        ordenadas da mais recente para a mais antiga.
        """
        aluno_id = self.kwargs['aluno_id']
        return Avaliacao.objects.filter(aluno=aluno_id).select_related(
            'aluno__usuario', 
            'instrutor__usuario'
        ).order_by('-data_avaliacao')
