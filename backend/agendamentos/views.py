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
        Ação customizada para inscrever um aluno em uma aula específica.
        Espera um 'aluno_id' no corpo da requisição.
        """
        aula = self.get_object()
        aluno_id = request.data.get("aluno_id")

        if not aluno_id:
            return Response(
                {"error": "O campo 'aluno_id' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # TODO: Adicionar lógica de permissão para esta ação

        serializer = AulaAlunoSerializer(data={"aula": aula.pk, "aluno": aluno_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AulaAlunoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar os agendamentos dos alunos."""

    queryset = AulaAluno.objects.all()
    serializer_class = AulaAlunoSerializer
    permission_classes = [IsAdminAgendamento]  # Temporário


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
