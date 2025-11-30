# studios/serializers.py
from rest_framework import serializers
from .models import Studio

class StudioSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Studio.
    
    Responsável por converter os dados do modelo Studio para JSON (serialização)
    e por validar os dados de entrada ao criar ou atualizar um studio (desserialização).
    """
    class Meta:
        model = Studio
        fields = ['id', 'nome', 'endereco']


# --- Serializers Aninhados para o Dashboard ---

class FinanceiroDashboardStudioSerializer(serializers.Serializer):
    receita_confirmada_mes = serializers.DecimalField(max_digits=10, decimal_places=2)
    receita_pendente_mes = serializers.DecimalField(max_digits=10, decimal_places=2)
    pagamentos_atrasados_total = serializers.IntegerField()
    novas_matriculas_mes = serializers.IntegerField()
    receita_produtos_mes = serializers.DecimalField(max_digits=10, decimal_places=2)


class AgendamentosDashboardStudioSerializer(serializers.Serializer):
    aulas_hoje = serializers.IntegerField()
    taxa_ocupacao_hoje = serializers.FloatField()
    alunos_em_lista_espera = serializers.IntegerField()
    taxa_ocupacao_media_30d = serializers.FloatField()


class UsuariosDashboardStudioSerializer(serializers.Serializer):
    alunos_ativos = serializers.IntegerField()
    colaboradores_ativos = serializers.IntegerField()
    novos_usuarios_semana = serializers.IntegerField()
    matriculas_expirando_mes = serializers.IntegerField()
    alunos_em_risco_churn = serializers.IntegerField()


class AlertasDashboardStudioSerializer(serializers.Serializer):
    notificacoes_nao_lidas = serializers.IntegerField()
    produtos_estoque_baixo = serializers.IntegerField()


class InsightsEstrategicosDashboardStudioSerializer(serializers.Serializer):
    plano_mais_popular = serializers.CharField(max_length=255)
    instrutor_destaque = serializers.CharField(max_length=255)
    total_avaliacoes = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    """
    Serializer principal para o dashboard de um estúdio específico.
    Reflete a estrutura de dados retornada pela DashboardStudioView.
    """
    studio_id = serializers.IntegerField()
    studio_name = serializers.CharField(max_length=255)
    financeiro = FinanceiroDashboardStudioSerializer()
    agendamentos = AgendamentosDashboardStudioSerializer()
    usuarios = UsuariosDashboardStudioSerializer()
    alertas = AlertasDashboardStudioSerializer()
    insights_estrategicos = InsightsEstrategicosDashboardStudioSerializer()
