# agendamentos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404
from datetime import *
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import (
    HorarioTrabalho,
    BloqueioAgenda,
    Modalidade,
    Aula,
    AulaAluno,
    Reposicao,
    ListaEspera,
    CreditoAula,
)
from .serializers import (
    HorarioTrabalhoSerializer, ModalidadeSerializer, ReposicaoSerializer, ListaEsperaSerializer,
    AgendamentoAlunoSerializer, AgendamentoStaffSerializer, CreditoAula, AgendamentoAlunoReadSerializer,
    CreditoAulaSerializer, BloqueioAgendaReadSerializer, BloqueioAgendaWriteSerializer, AulaReadSerializer, AulaWriteSerializer,
    AulaAlunoSerializer
)
from .permissions import HasRole, CanUpdateAula, IsOwnerDoAgendamento, Colaborador
from alunos.permissions import IsStaffAutorizado
from alunos.models import Aluno
from rest_framework.exceptions import PermissionDenied
from core.permissions import StudioPermissionMixin


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
class HorarioTrabalhoViewSet(StudioPermissionMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar Horários de Trabalho."""

    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    permission_classes = [IsAuthenticated]
    studio_filter_field = 'studio'


@extend_schema(tags=['Agendamentos - Bloqueios'])
@extend_schema_view(
    list=extend_schema(summary="Lista todos os bloqueios de agenda"),
    retrieve=extend_schema(summary="Busca um bloqueio pelo ID"),
    create=extend_schema(summary="Cria um novo bloqueio de agenda"),
    update=extend_schema(summary="Atualiza um bloqueio"),
    partial_update=extend_schema(summary="Atualiza parcialmente um bloqueio"),
    destroy=extend_schema(summary="Deleta um bloqueio"),
)
class BloqueioAgendaViewSet(StudioPermissionMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar Bloqueios de Agenda."""

    queryset = BloqueioAgenda.objects.all()
    permission_classes = [IsAuthenticated]
    studio_filter_field = 'studio'

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return BloqueioAgendaReadSerializer
        return BloqueioAgendaWriteSerializer


@extend_schema(tags=['Agendamentos - Modalidades'])
@extend_schema_view(
    list=extend_schema(summary="Lista todas as modalidades de aula"),
    retrieve=extend_schema(summary="Busca uma modalidade pelo ID"),
    create=extend_schema(summary="Cria uma nova modalidade"),
    update=extend_schema(summary="Atualiza uma modalidade"),
    partial_update=extend_schema(summary="Atualiza parcialmente uma modalidade"),
    destroy=extend_schema(summary="Deleta uma modalidade"),
)
class ModalidadeViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar as Modalidades de aula."""

    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    def get_permissions(self):
        return [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]


@extend_schema(tags=['Agendamentos - Aulas (Gestão de Aulas)'])
@extend_schema_view(
    list=extend_schema(summary="Lista aulas (filtrado por perfil)"),
    retrieve=extend_schema(summary="Busca uma aula pelo ID"),
    create=extend_schema(summary="Cria uma nova aula (Apenas Admins)"),
    update=extend_schema(summary="Atualiza uma aula (Admin/Recep/Dono)"),
    partial_update=extend_schema(summary="Atualiza parcialmente uma aula (Admin/Recep/Dono)"),
    destroy=extend_schema(summary="Deleta uma aula (Apenas Admins)"),
)
class AulaViewSet(StudioPermissionMixin, viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Aulas (CRUD de Aulas).
    Esta view NÃO lida com inscrições de alunos.
    """
    
    queryset = Aula.objects.all().order_by('data_hora_inicio')
    studio_filter_field = 'studio'

    def get_serializer_class(self):
        """
        Diferencia o serializer para Leitura (GET) e Escrita (POST/PUT/PATCH).
        """
        if self.action in ['list', 'retrieve']:
            return AulaReadSerializer
        return AulaWriteSerializer

    def get_permissions(self):
        """
        Define permissões granulares por ação para a gestão de Aulas.
        """
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # (Usando IsStaffAutorizado que o seu amigo já usa,
        # ou a permissão HasRole dele)
        elif self.action in ['create', 'destroy']:
            return [IsStaffAutorizado()] # Apenas Staff pode Criar/Deletar
        elif self.action in ['update', 'partial_update']:
            return [CanUpdateAula()] # Staff ou Dono podem Editar
        return [IsAuthenticated()]

    
@extend_schema(tags=['Agendamentos - Inscrições (Aulas-Alunos)'])
@extend_schema_view(
    list=extend_schema(summary="Lista todas as inscrições (agendamentos)"),
    retrieve=extend_schema(summary="Busca um agendamento pelo ID"),
    create=extend_schema(summary="Cria um novo agendamento (inscrição) para um aluno em uma aula"),
    update=extend_schema(summary="Atualiza um agendamento (ex: marcar presença) - Apenas Staff"),
    partial_update=extend_schema(summary="Atualiza parcialmente um agendamento - Apenas Staff"),
    destroy=extend_schema(summary="Cancela um agendamento (aluno ou staff)"),
)
class AulaAlunoViewSet(StudioPermissionMixin, viewsets.ModelViewSet):
    """
    ViewSet para gerenciar as inscrições (Agendamentos) dos alunos nas aulas.
    Endpoint: /api/agendamentos/aulas-alunos/
    """
    queryset = AulaAluno.objects.all()
    studio_filter_field = 'aula__studio'
    # As permissões de base são verificadas, e depois as permissões de objeto
    permission_classes = [IsAuthenticated] 

    def get_serializer_class(self):
        """
        Diferencia o serializer para Leitura (GET) e Escrita (POST/PUT/PATCH).
        (Esta é a lógica da Issue #62)
        """
        # GET (Listar ou Detalhar uma inscrição)
        if self.action in ['list', 'retrieve']:
            return AgendamentoAlunoReadSerializer

        # POST (Criar uma inscrição)
        if self.action == 'create':
            # (Esta é a lógica da Issue #65 - Fluxo Duplo)
            staff_permission = IsStaffAutorizado()
            if staff_permission.has_permission(self.request, self):
                return AgendamentoStaffSerializer # Staff pode inscrever outros
            return AgendamentoAlunoSerializer     # Aluno só se inscreve
        
        # PUT/PATCH (Atualizar uma inscrição - ex: Status de Presença)
        if self.action in ['update', 'partial_update']:
            # Apenas Staff pode atualizar (ex: marcar presença)
            return AgendamentoStaffSerializer
        
        return AgendamentoAlunoReadSerializer # Padrão

    def get_permissions(self):
        """
        Define permissões de objeto (para update, delete, retrieve).
        (Esta é a lógica da Issue #65 - Cancelamento)
        """
        # Para criar (POST) ou listar (GET), basta estar autenticado
        if self.action in ['create', 'list']:
            return [IsAuthenticated()]
        
        # Para alterar, ver detalhes ou deletar,
        # você deve ser o Dono do Agendamento OU um Staff.
        return [IsAuthenticated(), (IsOwnerDoAgendamento | IsStaffAutorizado)()]
    def perform_create(self, serializer):
        """
        (Esta é a nossa lógica da Issue #63 para consumir créditos)
        """
        if isinstance(serializer, AgendamentoAlunoSerializer):
            # --- FLUXO ALUNO ---
            if not hasattr(self.request.user, 'aluno'):
                raise PermissionDenied("Você não possui um perfil de aluno para realizar este agendamento.")
            
            # (A validação de conflito/vagas/crédito já ocorreu no serializer)
            credito_a_utilizar = serializer.validated_data.pop('credito_a_utilizar', None)
            agendamento = serializer.save(aluno=self.request.user.aluno)

            # Consome o crédito (se aplicável)
            if credito_a_utilizar:        
                agendamento.credito_utilizado = credito_a_utilizar
                credito_a_utilizar.data_invalidacao = timezone.now()
                # O Aluno usou o seu próprio crédito
                credito_a_utilizar.invalidado_por = self.request.user 
                credito_a_utilizar.save()
                agendamento.save()
        else:
            # --- FLUXO STAFF ---
            # O AgendamentoStaffSerializer já cuida de consumir o crédito
            # dentro do seu próprio método .create()
            serializer.save()
            
@extend_schema(tags=['Alunos - Créditos (Gestão Staff)'])
class CreditoAulaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para a GESTÃO de Créditos de um Aluno (CRUD de Créditos).
    Acessada via: /api/alunos/<aluno_cpf>/creditos/
    [Esta ViewSet é importada por 'alunos/urls.py']
    """
    queryset = CreditoAula.objects.all()
    serializer_class = CreditoAulaSerializer
    # Apenas Staff Autorizado pode gerir créditos
    permission_classes = [IsAuthenticated, IsStaffAutorizado] 

    def get_queryset(self):
        """
        Filtra os créditos para pertencerem apenas ao aluno
        especificado na URL (aluno_cpf).
        """
        aluno_cpf = self.kwargs.get("aluno_cpf")
        if aluno_cpf:
            # Filtra os créditos pelo CPF do aluno na URL
            return CreditoAula.objects.filter(aluno__usuario__cpf=aluno_cpf)
        
        # Se não houver CPF na URL, não retorna nada.
        return CreditoAula.objects.none() 

    def perform_create(self, serializer):
        """
        [TAREFA] Adicionar créditos (POST)
        (Esta é a lógica do seu amigo para ADICIONAR crédito)
        """
        aluno_cpf = self.kwargs.get("aluno_cpf")
        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)

        # Salva o crédito associando ao aluno da URL e ao staff logado
        serializer.save(
            aluno=aluno,
            adicionado_por=self.request.user # (Assume que staff logado é o user)
        )

    @action(detail=True, methods=["patch"], name="Invalidar Crédito")
    def invalidar(self, request, pk=None, aluno_cpf=None):
        """
        [TAREFA] Invalidar créditos (PATCH)
        URL: PATCH /api/alunos/<aluno_cpf>/creditos/<pk>/invalidar/
        """
        credito = self.get_object() # get_object usa o queryset (que já está filtrado)

        if credito.data_invalidacao is not None:
            return Response(
                {"detail": "Este crédito já foi invalidado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        credito.invalidado_por = request.user.colaborador if hasattr(request.user, 'colaborador') else request.user
        credito.data_invalidacao = timezone.now()
        credito.save()

        serializer = self.get_serializer(credito)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        """Desabilitado. Não se "edita" um crédito, se invalida e cria outro."""
        return Response(
            {"detail": 'Método "PUT" não permitido.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, *args, **kwargs):
        """Desabilitado. Use /invalidar/ para alterar o status."""
        return Response(
            {"detail": 'Método "PATCH" não permitido. Use a ação /invalidar/.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, *args, **kwargs):
        """Desabilitado em favor de 'invalidar' (PATCH)"""
        return Response(
            {
                "detail": "Deleção destrutiva não permitida. Use a ação /invalidar/."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
        
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