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
        # --- CORRIGIDO ---
        # O filtro agora usa o caminho correto através do modelo Usuario
        return Avaliacao.objects.filter(aluno__usuario__cpf=aluno_cpf).order_by('-data_avaliacao')

    def perform_create(self, serializer):
        """Associa o aluno, o instrutor (usuário logado) e o estúdio automaticamente ao criar uma nova avaliação."""
        aluno_cpf = self.kwargs.get('aluno_cpf')
        
        # --- CORRIGIDO ---
        # A busca do aluno agora usa o caminho correto (usuario__cpf)
        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)
        
        instrutor = get_object_or_404(Colaborador, usuario=self.request.user)

        studio = None
        # Prioritize studio from Aluno if there's only one associated studio
        if aluno.unidades.count() == 1:
            studio = aluno.unidades.first()
        
        # If Aluno has multiple studios or none, try to get studio from request data
        if not studio and 'studio' in serializer.validated_data:
            studio = serializer.validated_data['studio']
        
        # If still no studio, fall back to instructor's single associated studio
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
        
        # --- CORRIGIDO ---
        # O filtro agora usa o caminho correto através do modelo Usuario
        avaliacao = Avaliacao.objects.filter(aluno__usuario__cpf=aluno_cpf).order_by('-data_avaliacao').first()
        
        if not avaliacao:
            raise Http404("Nenhuma avaliação encontrada para este aluno.")
        
        self.check_object_permissions(self.request, avaliacao)
        
        return avaliacao