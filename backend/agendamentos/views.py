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
from rest_framework.exceptions import PermissionDenied, ValidationError
from core.permissions import StudioPermissionMixin
from notifications.models import Notification

def processar_lista_espera(aula):
    """
    Cenário 4: Tenta inscrever o próximo aluno da lista de espera em uma aula.
    """
    if not aula.lista_espera.exists():
        return

    # Itera sobre a lista de espera em ordem de inscrição
    for inscricao_espera in aula.lista_espera.order_by('data_inscricao'):
        aluno_em_espera = inscricao_espera.aluno
        
        # 1. Verifica se o aluno tem crédito válido
        credito_disponivel = CreditoAula.objects.filter(
            aluno=aluno_em_espera,
            data_invalidacao__isnull=True,
            data_validade__gte=aula.data_hora_inicio.date()
        ).first()

        if credito_disponivel:
            # 2. Tenta criar o agendamento
            try:
                novo_agendamento = AulaAluno.objects.create(
                    aula=aula,
                    aluno=aluno_em_espera,
                    credito_utilizado=credito_disponivel
                )
                # Debita o crédito
                credito_disponivel.data_invalidacao = timezone.now()
                credito_disponivel.save()

                # 3.A Notificação de Sucesso
                Notification.objects.create(
                    recipient=aluno_em_espera.usuario,
                    message=f"Conseguimos! Você foi inscrito(a) automaticamente na aula de {aula.modalidade.nome} do dia {aula.data_hora_inicio.strftime('%d/%m')}.",
                    level=Notification.NotificationLevel.SUCCESS,
                    content_object=novo_agendamento
                )
                # Remove da lista de espera e para o processo
                inscricao_espera.delete()
                return
            except Exception:
                # Se houver outro erro (ex: conflito de horário), notifica e continua
                pass
        
        # 3.B Notificação de Falha (Falta de Crédito)
        Notification.objects.create(
            recipient=aluno_em_espera.usuario,
            message=f"Uma vaga surgiu na aula de {aula.modalidade.nome}, mas não conseguimos te inscrever por falta de créditos válidos. Adquira um novo plano para não perder a próxima chance!",
            level=Notification.NotificationLevel.WARNING,
            content_object=aula
        )
        # Remove o aluno da lista para tentar o próximo
        inscricao_espera.delete()


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
    queryset = Aula.objects.all().order_by('data_hora_inicio')
    studio_filter_field = 'studio'

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AulaReadSerializer
        return AulaWriteSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'destroy']:
            return [IsStaffAutorizado()]
        elif self.action in ['update', 'partial_update']:
            return [CanUpdateAula()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='lista-espera', permission_classes=[IsAuthenticated, HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])])
    def lista_espera(self, request, pk=None):
        aula = self.get_object()
        lista_espera = ListaEspera.objects.filter(aula=aula).order_by('data_inscricao')
        serializer = ListaEsperaSerializer(lista_espera, many=True)
        return Response(serializer.data)

    
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
    queryset = AulaAluno.objects.all()
    studio_filter_field = 'aula__studio'
    permission_classes = [IsAuthenticated] 

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AgendamentoAlunoReadSerializer
        if self.action == 'create':
            staff_permission = IsStaffAutorizado()
            if staff_permission.has_permission(self.request, self):
                return AgendamentoStaffSerializer
            return AgendamentoAlunoSerializer
        if self.action in ['update', 'partial_update']:
            return AgendamentoStaffSerializer
        return AgendamentoAlunoReadSerializer

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), (IsOwnerDoAgendamento | IsStaffAutorizado)()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('_adicionado_lista_espera'):
            return Response(
                {"detail": "Aula cheia. Você foi adicionado à lista de espera."},
                status=status.HTTP_201_CREATED
            )
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.validated_data.pop('entrar_lista_espera', None)
        if isinstance(serializer, AgendamentoAlunoSerializer):
            if not hasattr(self.request.user, 'aluno'):
                raise PermissionDenied("Você não possui um perfil de aluno para realizar este agendamento.")
            credito_a_utilizar = serializer.validated_data.pop('credito_a_utilizar', None)
            agendamento = serializer.save(aluno=self.request.user.aluno)
            if credito_a_utilizar:        
                agendamento.credito_utilizado = credito_a_utilizar
                credito_a_utilizar.data_invalidacao = timezone.now()
                credito_a_utilizar.invalidado_por = self.request.user 
                credito_a_utilizar.save()
                agendamento.save()
        else:
            serializer.save()

    def perform_destroy(self, instance):
        """
        Sobrescreve o método de deleção para acionar a lógica da lista de espera.
        """
        aula = instance.aula
        instance.delete()
        processar_lista_espera(aula)

            
@extend_schema(tags=['Alunos - Créditos (Gestão Staff)'])
class CreditoAulaViewSet(viewsets.ModelViewSet):
    queryset = CreditoAula.objects.all()
    serializer_class = CreditoAulaSerializer
    permission_classes = [IsAuthenticated, IsStaffAutorizado] 

    def get_queryset(self):
        aluno_cpf = self.kwargs.get("aluno_cpf")
        if aluno_cpf:
            return CreditoAula.objects.filter(aluno__usuario__cpf=aluno_cpf)
        return CreditoAula.objects.none() 

    def perform_create(self, serializer):
        aluno_cpf = self.kwargs.get("aluno_cpf")
        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)
        serializer.save(
            aluno=aluno,
            adicionado_por=self.request.user
        )

    @action(detail=True, methods=["patch"], name="Invalidar Crédito")
    def invalidar(self, request, pk=None, aluno_cpf=None):
        credito = self.get_object()
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
        return Response(
            {"detail": 'Método "PUT" não permitido.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, *args, **kwargs):
        return Response(
            {"detail": 'Método "PATCH" não permitido. Use a ação /invalidar/.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, *args, **kwargs):
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
