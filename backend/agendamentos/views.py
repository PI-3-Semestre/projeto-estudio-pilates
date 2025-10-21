# agendamentos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera
)
from .serializers import (
    HorarioTrabalhoSerializer, BloqueioAgendaSerializer, ModalidadeSerializer,
    AulaSerializer, AulaAlunoSerializer, ReposicaoSerializer, ListaEsperaSerializer
)
from .permissions import IsAdminAgendamento

class HorarioTrabalhoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Horários de Trabalho."""
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    permission_classes = [IsAdminAgendamento]

class BloqueioAgendaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Bloqueios de Agenda."""
    queryset = BloqueioAgenda.objects.all()
    serializer_class = BloqueioAgendaSerializer
    permission_classes = [IsAdminAgendamento]

class ModalidadeViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar as Modalidades de aula."""
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    permission_classes = [IsAdminAgendamento]

class AulaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Aulas e inscrições de alunos."""
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtra o queryset de aulas com base no perfil do usuário.
        - Admin/Recepcionista: veem todas as aulas.
        - Instrutor/Fisioterapeuta: veem apenas suas próprias aulas.
        """
        user = self.request.user
        if not hasattr(user, 'colaborador'):
            return Aula.objects.none()

        perfis = user.colaborador.perfis.values_list('nome', flat=True)

        if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'] for perfil in perfis):
            return Aula.objects.all()
        
        if any(perfil in ['INSTRUTOR', 'FISIOTERAPEUTA'] for perfil in perfis):
            return Aula.objects.filter(
                Q(instrutor_principal=user.colaborador) | Q(instrutor_substituto=user.colaborador)
            ).distinct()

        return Aula.objects.none()

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
        
        # TODO: Adicionar lógica de permissão para esta ação

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
    permission_classes = [IsAdminAgendamento] # Temporário

class ReposicaoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar as reposições dos alunos."""
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [IsAdminAgendamento] # Temporário

class ListaEsperaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar a lista de espera."""
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    permission_classes = [IsAdminAgendamento] # Temporário