# agendamentos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera
)
from .serializers import (
    HorarioTrabalhoSerializer, BloqueioAgendaSerializer, ModalidadeSerializer,
    AulaSerializer, AulaAlunoSerializer, ReposicaoSerializer, ListaEsperaSerializer
)

class HorarioTrabalhoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Horários de Trabalho."""
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    # TODO: Adicionar permissões para apenas administradores

class BloqueioAgendaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Bloqueios de Agenda."""
    queryset = BloqueioAgenda.objects.all()
    serializer_class = BloqueioAgendaSerializer
    # TODO: Adicionar permissões para apenas administradores

class ModalidadeViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar as Modalidades de aula."""
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    # TODO: Adicionar permissões para apenas administradores

class AulaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Aulas e inscrições de alunos."""
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer

    @action(detail=True, methods=['post'], url_path='inscrever')
    def inscrever_aluno(self, request, pk=None):
        """
        Ação customizada para inscrever um aluno em uma aula específica.
        Espera um 'aluno_id' no corpo da requisição.
        """
        aula = self.get_object()
        aluno_id = request.data.get('aluno_id')

        if not aluno_id:
            return Response(
                {'error': "O campo 'aluno_id' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Lógica de validação (Fase 3) virá aqui.
        # Ex: Verificar capacidade máxima, etc.

        serializer = AulaAlunoSerializer(data={'aula': aula.pk, 'aluno': aluno_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AulaAlunoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar os agendamentos dos alunos."""
    queryset = AulaAluno.objects.all()
    serializer_class = AulaAlunoSerializer

class ReposicaoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar as reposições dos alunos."""
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer

class ListaEsperaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar a lista de espera."""
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer