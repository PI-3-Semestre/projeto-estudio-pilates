# agendamentos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from drf_spectacular.utils import extend_schema

from .permissions import HasRole, IsOwnerDaAula
from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera
)
from .serializers import (
    HorarioTrabalhoSerializer,
    BloqueioAgendaReadSerializer, BloqueioAgendaWriteSerializer,
    ModalidadeSerializer,
    AulaReadSerializer, AulaWriteSerializer,
    AulaAlunoSerializer, ReposicaoSerializer, ListaEsperaSerializer
)

@extend_schema(tags=['Agendamentos - Horários de Trabalho'])
class HorarioTrabalhoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Horários de Trabalho."""
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]

@extend_schema(tags=['Agendamentos - Bloqueios de Agenda'])
class BloqueioAgendaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Bloqueios de Agenda."""
    queryset = BloqueioAgenda.objects.all()

    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return BloqueioAgendaReadSerializer
        return BloqueioAgendaWriteSerializer

@extend_schema(tags=['Agendamentos - Modalidades'])
class ModalidadeViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar as Modalidades de aula."""
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer

    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]

@extend_schema(tags=['Agendamentos - Aulas'])
class AulaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Aulas e inscrições de alunos."""

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AulaReadSerializer
        return AulaWriteSerializer
    
    def get_permissions(self):
        """Define e retorna a lista de instâncias de permissão com base na ação."""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        
        elif self.action in ['create', 'destroy']:
            return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
            
        elif self.action in ['update', 'partial_update']:
            return [
                HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']),
                IsOwnerDaAula()
            ]
            
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'colaborador'):
            return Aula.objects.none()
        perfis = user.colaborador.perfis.values_list('nome', flat=True)
        if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'] for perfil in perfis):
            return Aula.objects.all().order_by('data_hora_inicio')
        if any(perfil in ['INSTRUTOR', 'FISIOTERAPEUTA'] for perfil in perfis):
            return Aula.objects.filter(
                Q(instrutor_principal=user.colaborador) | Q(instrutor_substituto=user.colaborador)
            ).distinct().order_by('data_hora_inicio')
        return Aula.objects.none()

    @action(detail=True, methods=['post'], url_path='inscrever')
    def inscrever_aluno(self, request, pk=None):
        aula = self.get_object()
        aluno_id = request.data.get('aluno_id')
        if not aluno_id:
            return Response({'error': "O campo 'aluno_id' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = AulaAlunoSerializer(data={'aula': aula.pk, 'aluno': aluno_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=['Agendamentos - Alunos por Aula'])
class AulaAlunoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar os agendamentos dos alunos."""
    queryset = AulaAluno.objects.all()
    serializer_class = AulaAlunoSerializer
    
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])]

@extend_schema(tags=['Agendamentos - Reposições'])
class ReposicaoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar as reposições dos alunos."""
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [IsAuthenticated]

@extend_schema(tags=['Agendamentos - Listas de Espera'])
class ListaEsperaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar a lista de espera."""
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])]