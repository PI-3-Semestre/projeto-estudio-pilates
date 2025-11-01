# agendamentos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema

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
    HorarioTrabalhoSerializer,
    BloqueioAgendaSerializer,
    ModalidadeSerializer,
    AulaSerializer,
    AulaAlunoSerializer,
    ReposicaoSerializer,
    ListaEsperaSerializer,
    CreditoAulaSerializer,
)
from .permissions import IsAdminAgendamento
from alunos.permissions import IsStaffAutorizado
from alunos.models import Aluno


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
        if not hasattr(user, "colaborador"):
            return Aula.objects.none()

        perfis = user.colaborador.perfis.values_list("nome", flat=True)

        if any(
            perfil in ["ADMIN_MASTER", "ADMINISTRADOR", "RECEPCIONISTA"]
            for perfil in perfis
        ):
            return Aula.objects.all()

        if any(perfil in ["INSTRUTOR", "FISIOTERAPEUTA"] for perfil in perfis):
            return Aula.objects.filter(
                Q(instrutor_principal=user.colaborador)
                | Q(instrutor_substituto=user.colaborador)
            ).distinct()

        return Aula.objects.none()

    @action(detail=True, methods=["post"], url_path="inscrever")
    def inscrever_aluno(self, request, pk=None):
        """
        Ação customizada para inscrever um aluno em uma aula.
        - Alunos podem se inscrever (sem passar aluno_id).
        - Staff pode inscrever um aluno específico (passando aluno_id).
        """
        aula = self.get_object()
        user = request.user
        aluno_id_request = request.data.get("aluno_id")

        target_aluno = None

        # 1. Identificar o Aluno e Validar Permissões
        if aluno_id_request:
            # Cenário: Staff agendando um aluno
            if (
                not hasattr(user, "colaborador")
                or not user.colaborador.perfis.filter(
                    nome__in=["ADMINISTRADOR", "RECEPCIONISTA"]
                ).exists()
            ):
                return Response(
                    {"error": "Você não tem permissão para agendar outros alunos."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            try:
                target_aluno = Aluno.objects.get(pk=aluno_id_request)
            except Aluno.DoesNotExist:
                return Response(
                    {"error": "Aluno especificado não encontrado."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # Cenário: Aluno agendando a si mesmo
            if not hasattr(user, "aluno"):
                return Response(
                    {"error": "Apenas alunos podem se agendar."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            target_aluno = user.aluno

        # 2. Validações de Negócio
        # Verifica se a aula está lotada
        if aula.alunos_inscritos.count() >= aula.capacidade_maxima:
            return Response(
                {"error": "A aula está lotada."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Verifica se o aluno já está inscrito
        if AulaAluno.objects.filter(aula=aula, aluno=target_aluno).exists():
            return Response(
                {"error": "Você já está inscrito nesta aula."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Lógica de Créditos
        today = timezone.now().date()
        credito_disponivel = (
            CreditoAula.objects.filter(
                aluno=target_aluno,
                data_validade__gte=today,
                agendamento_uso__isnull=True,  # Garante que o crédito não foi usado
            )
            .order_by("data_validade")
            .first()
        )

        if not credito_disponivel:
            return Response(
                {"error": "Nenhum crédito de aula disponível."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 4. Criar o agendamento e consumir o crédito
        agendamento = AulaAluno.objects.create(
            aula=aula, aluno=target_aluno, credito_utilizado=credito_disponivel
        )

        # Marca o crédito como utilizado, associando ao agendamento
        # Esta lógica pode ser movida para um signal se preferir
        credito_disponivel.agendamento_uso = agendamento
        credito_disponivel.save()

        serializer = AulaAlunoSerializer(agendamento)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AulaAlunoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar os agendamentos dos alunos."""

    queryset = AulaAluno.objects.all()
    serializer_class = AulaAlunoSerializer
    permission_classes = [IsAuthenticated] # Alterado para permitir acesso a usuários autenticados

    def get_queryset(self):
        """
        Filtra os agendamentos para que usuários vejam apenas o que lhes diz respeito.
        - Alunos veem seus próprios agendamentos.
        - Staff (Admin/Recepcionista) veem todos.
        """
        user = self.request.user
        if hasattr(user, 'colaborador') and user.colaborador.perfis.filter(nome__in=["ADMINISTRADOR", "RECEPCIONISTA"]).exists():
            return AulaAluno.objects.all()
        if hasattr(user, 'aluno'):
            return AulaAluno.objects.filter(aluno=user.aluno)
        return AulaAluno.objects.none()

    @action(detail=True, methods=['delete'], url_path='cancelar')
    def cancelar_agendamento(self, request, pk=None):
        """
        Permite que um aluno cancele seu próprio agendamento ou que um admin/recepcionista cancele qualquer um.
        """
        agendamento = self.get_object()
        user = request.user

        # Lógica de Permissão
        is_owner = hasattr(user, 'aluno') and agendamento.aluno == user.aluno
        is_staff = hasattr(user, 'colaborador') and user.colaborador.perfis.filter(nome__in=["ADMINISTRADOR", "RECEPCIONISTA"]).exists()

        if not is_owner and not is_staff:
            return Response({"error": "Você não tem permissão para cancelar este agendamento."}, status=status.HTTP_403_FORBIDDEN)

        # Lógica de Negócio (reativar crédito)
        if agendamento.credito_utilizado:
            credito = agendamento.credito_utilizado
            credito.agendamento_uso = None
            credito.save()

        agendamento.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ReposicaoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar as reposições dos alunos."""

    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [IsAdminAgendamento]  # Temporário


class ListaEsperaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar a lista de espera."""

    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    permission_classes = [IsAdminAgendamento]  # Temporário


@extend_schema(tags=["Alunos - Créditos"])
class CreditoAulaViewSet(viewsets.ModelViewSet):
    """
    [SPRINT FEAT] ViewSet para Staff gerenciar os créditos de um aluno.
    Acesso: /api/alunos/<aluno_cpf>/creditos/
    """

    serializer_class = CreditoAulaSerializer
    permission_classes = [IsAuthenticated, IsStaffAutorizado]

    def get_queryset(self):
        """
        [TAREFA] Visualizar créditos (GET)
        Filtra os créditos pelo 'aluno_cpf' vindo da URL.
        """
        # 1. MUDANÇA AQUI: de 'aluno_pk' para 'aluno_cpf'
        aluno_cpf = self.kwargs.get("aluno_cpf")
        if not aluno_cpf:
            return CreditoAula.objects.none()

        # 2. MUDANÇA AQUI: Filtra pelo 'cpf' do aluno
        # (Assumindo que seu modelo Aluno tem um campo 'cpf')
        return CreditoAula.objects.filter(aluno__usuario__cpf=aluno_cpf)

    def perform_create(self, serializer):
        """
        [TAREFA] Adicionar créditos (POST)
        """
        # 3. MUDANÇA AQUI: Busca o Aluno pelo 'cpf' da URL
        aluno_cpf = self.kwargs.get("aluno_cpf")
        aluno = get_object_or_404(Aluno, usuario__cpf=aluno_cpf)

        serializer.save(
            aluno=aluno,
            adicionado_por=self.request.user,
        )

    @action(detail=True, methods=["patch"], name="Invalidar Crédito")
    def invalidar(self, request, pk=None, aluno_cpf=None):  # 4. MUDANÇA AQUI
        """
        [TAREFA] Invalidar créditos (PATCH)
        URL: PATCH /api/alunos/<aluno_cpf>/creditos/<pk>/invalidar/
        """
        credito = self.get_object()

        if credito.data_invalidacao is not None:
            return Response(
                {"detail": "Este crédito já foi invalidado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        credito.invalidado_por = request.user
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
        """
        [TAREFA] (DELETE) - Desabilitado em favor de 'invalidar' (PATCH)
        Não permitimos DELETE destrutivo para manter a auditoria.
        """
        return Response(
            {
                "detail": "Deleção destrutiva não permitida. Use a ação /invalidar/ para anular um crédito."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
