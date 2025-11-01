# agendamentos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view

from .permissions import HasRole, IsOwnerDaAula, CanUpdateAula
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

# ... (ViewSets de HorarioTrabalho, BloqueioAgenda, Modalidade - Inalterados) ...
@extend_schema(tags=['Agendamentos - Horários de Trabalho'])
@extend_schema_view(
    list=extend_schema(summary="Lista todos os horários de trabalho"),
    retrieve=extend_schema(summary="Busca um horário de trabalho pelo ID"),
    create=extend_schema(summary="Cria um novo horário de trabalho"),
    update=extend_schema(summary="Atualiza um horário de trabalho"),
    partial_update=extend_schema(summary="Atualiza parcialmente um horário de trabalho"),
    destroy=extend_schema(summary="Deleta um horário de trabalho"),
)
class HorarioTrabalhoViewSet(viewsets.ModelViewSet):
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]

@extend_schema(tags=['Agendamentos - Bloqueios de Agenda'])
@extend_schema_view(
    list=extend_schema(summary="Lista todos os bloqueios de agenda"),
    retrieve=extend_schema(summary="Busca um bloqueio de agenda pelo ID"),
    create=extend_schema(summary="Cria um novo bloqueio de agenda"),
    update=extend_schema(summary="Atualiza um bloqueio de agenda"),
    partial_update=extend_schema(summary="Atualiza parcialmente um bloqueio de agenda"),
    destroy=extend_schema(summary="Deleta um bloqueio de agenda"),
)
class BloqueioAgendaViewSet(viewsets.ModelViewSet):
    queryset = BloqueioAgenda.objects.all()
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return BloqueioAgendaReadSerializer
        return BloqueioAgendaWriteSerializer

@extend_schema(tags=['Agendamentos - Modalidades'])
@extend_schema_view(
    list=extend_schema(summary="Lista todas as modalidades"),
    retrieve=extend_schema(summary="Busca uma modalidade pelo ID"),
    create=extend_schema(summary="Cria uma nova modalidade"),
    update=extend_schema(summary="Atualiza uma modalidade"),
    partial_update=extend_schema(summary="Atualiza parcialmente uma modalidade"),
    destroy=extend_schema(summary="Deleta uma modalidade"),
)
class ModalidadeViewSet(viewsets.ModelViewSet):
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]

@extend_schema(tags=['Agendamentos - Aulas'])
@extend_schema_view(
    list=extend_schema(summary="Lista aulas (filtrado por perfil)"),
    retrieve=extend_schema(summary="Busca uma aula pelo ID"),
    create=extend_schema(summary="Cria uma nova aula (Apenas Admins)"),
    update=extend_schema(summary="Atualiza uma aula (Admin/Recep/Dono)"),
    partial_update=extend_schema(summary="Atualiza parcialmente uma aula (Admin/Recep/Dono)"),
    destroy=extend_schema(summary="Deleta uma aula (Apenas Admins)"),
)
class AulaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Aulas e inscrições de alunos."""

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AulaReadSerializer
        return AulaWriteSerializer
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'destroy']:
            return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
        elif self.action in ['update', 'partial_update']:
            return [CanUpdateAula()]
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
    @extend_schema(
        summary="Inscreve um aluno em uma aula específica",
        request={
            'application/json': {
                'type': 'object',
                'properties': {'aluno_id': {'type': 'integer'}},
                'required': ['aluno_id']
            }
        },
        responses={201: AulaAlunoSerializer}
    )
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
@extend_schema_view(
    list=extend_schema(summary="Lista inscrições (filtrado por perfil)"),
    retrieve=extend_schema(summary="Busca uma inscrição pelo ID (filtrado por perfil)"),
    create=extend_schema(summary="Inscreve um aluno em uma aula (Admin/Recep)"),
    update=extend_schema(summary="Atualiza uma inscrição (Admin/Recep)"),
    partial_update=extend_schema(summary="Atualiza parcialmente uma inscrição (Admin/Recep)"),
    destroy=extend_schema(summary="Remove um aluno de uma aula (Admin/Recep)"),
)
class AulaAlunoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar os agendamentos dos alunos.
    - Admin/Recep: Acesso total.
    - Instrutor: Acesso apenas leitura (GET) e somente para suas próprias aulas.
    """
    queryset = AulaAluno.objects.all()
    serializer_class = AulaAlunoSerializer
    
    def get_permissions(self):
        """
        Permissões dinâmicas:
        - GET (list, retrieve): Qualquer autenticado pode (filtrado pelo queryset).
        - POST, PUT, PATCH, DELETE: Apenas Admin ou Recepcionista.
        """
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])]

    def get_queryset(self):
        """
        Filtra os agendamentos de alunos.
        - Admin/Recep: veem todos.
        - Instrutor: vê apenas agendamentos das suas próprias aulas.
        """
        user = self.request.user
        if not hasattr(user, 'colaborador'):
            return AulaAluno.objects.none()

        perfis = user.colaborador.perfis.values_list('nome', flat=True)


        if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'] for perfil in perfis):
            return AulaAluno.objects.all()
        

        if any(perfil in ['INSTRUTOR', 'FISIOTERAPEUTA'] for perfil in perfis):
            return AulaAluno.objects.filter(
                Q(aula__instrutor_principal=user.colaborador) |
                Q(aula__instrutor_substituto=user.colaborador)
            ).distinct()


        return AulaAluno.objects.none()


@extend_schema(tags=['Agendamentos - Reposições'])
@extend_schema_view(
    list=extend_schema(summary="Lista todas as reposições disponíveis"),
    retrieve=extend_schema(summary="Busca uma reposição pelo ID"),
)
class ReposicaoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [IsAuthenticated]

@extend_schema(tags=['Agendamentos - Listas de Espera'])
@extend_schema_view(
    list=extend_schema(summary="Lista todas as inscrições em listas de espera"),
    retrieve=extend_schema(summary="Busca uma inscrição na lista de espera pelo ID"),
    create=extend_schema(summary="Adiciona um aluno à lista de espera de uma aula"),
    update=extend_schema(summary="Atualiza o status de um aluno na lista de espera"),
    partial_update=extend_schema(summary="Atualiza parcialmente o status de um aluno"),
    destroy=extend_schema(summary="Remove um aluno da lista de espera"),
)
class ListaEsperaViewSet(viewsets.ModelViewSet):
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])]