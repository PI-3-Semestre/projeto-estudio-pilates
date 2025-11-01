# agendamentos/serializers.py
import datetime
from rest_framework import serializers
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


class HorarioTrabalhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioTrabalho
        fields = "__all__"


class BloqueioAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueioAgenda
        fields = "__all__"


class ModalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidade
        fields = "__all__"


class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = "__all__"


class AulaAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AulaAluno
        fields = "__all__"


class ReposicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reposicao
        fields = "__all__"


class ListaEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListaEspera
        fields = "__all__"


class CreditoAulaSerializer(serializers.ModelSerializer):
    """
    Serializer para a gestão de créditos de aula por Staff.
    """

    # Campos 'read-only' para enriquecer a resposta GET (Auditoria)
    # Puxa o nome do usuário de staff que adicionou o crédito
    adicionado_por_nome = serializers.CharField(
        source="adicionado_por.get_full_name",  # Assumindo que seu Usuario tem get_full_name
        read_only=True,
        default=None,
    )

    # Puxa o nome do usuário de staff que invalidou o crédito
    invalidado_por_nome = serializers.CharField(
        source="invalidado_por.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = CreditoAula
        fields = [
            "id",
            "aluno",  # Será preenchido pela view (da URL)
            "quantidade",  # Obrigatório no POST
            "data_validade",  # Obrigatório no POST
            "data_adicao",
            "adicionado_por",
            "adicionado_por_nome",  # Campo de auditoria (GET)
            "data_invalidacao",
            "invalidado_por",
            "invalidado_por_nome",  # Campo de auditoria (GET)
            "agendamento_origem",  # Para créditos de reposição
        ]

        # Define quais campos SÃO OBRIGATÓRIOS no POST/PATCH
        # (Todos os outros em 'fields' serão 'read-only' por padrão)
        extra_kwargs = {
            # 'aluno' será 'read_only' no serializer, pois será
            # definido pela View (baseado no aluno_id da URL).
            "aluno": {"read_only": True},
            # Campos de auditoria são sempre read-only
            "data_adicao": {"read_only": True},
            "adicionado_por": {"read_only": True},
            "data_invalidacao": {"read_only": True},
            "invalidado_por": {"read_only": True},
            "agendamento_origem": {"read_only": True},
            # Campos de entrada obrigatórios no POST
            "quantidade": {"required": True},
            "data_validade": {"required": True},
        }

    def validate_data_validade(self, value):
        """
        [CRITÉRIO DE ACEITAÇÃO]
        Validação: Não permitir data de validade no passado.
        """
        if value and value < datetime.date.today():
            raise serializers.ValidationError(
                "A data de validade não pode ser no passado."
            )
        return value

    def validate_quantidade(self, value):
        """
        [CRITÉRIO DE ACEITAÇÃO]
        Validação: Não adicionar créditos negativos ou zero.
        (O 'PositiveIntegerField' no model já ajuda, mas
         o 'MinValueValidator(1)' é a garantia).
        """
        if value <= 0:
            raise serializers.ValidationError(
                "A quantidade de créditos deve ser 1 ou mais."
            )
        return value
