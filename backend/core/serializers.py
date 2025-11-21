# backend/core/serializers.py
from rest_framework import serializers

class FinanceiroDashboardSerializer(serializers.Serializer):
    """Resumo do setor financeiro."""
    receita_confirmada_mes = serializers.DecimalField(max_digits=10, decimal_places=2)
    receita_pendente_mes = serializers.DecimalField(max_digits=10, decimal_places=2)
    pagamentos_atrasados_total = serializers.IntegerField()

class AgendamentosDashboardSerializer(serializers.Serializer):
    """Resumo dos agendamentos e ocupação."""
    aulas_hoje = serializers.IntegerField()
    taxa_ocupacao_hoje = serializers.FloatField()
    alunos_em_lista_espera = serializers.IntegerField()

class UsuariosDashboardSerializer(serializers.Serializer):
    """Resumo dos usuários e métricas de retenção."""
    alunos_ativos = serializers.IntegerField()
    colaboradores_ativos = serializers.IntegerField()
    novos_usuarios_semana = serializers.IntegerField()
    matriculas_expirando_mes = serializers.IntegerField()
    alunos_em_risco_churn = serializers.IntegerField()

class AlertasDashboardSerializer(serializers.Serializer):
    """Alertas e ações rápidas."""
    notificacoes_nao_lidas = serializers.IntegerField()
    produtos_estoque_baixo = serializers.IntegerField()

class InsightsEstrategicosSerializer(serializers.Serializer):
    """Métricas de crescimento, eficiência e performance."""
    novas_matriculas_mes = serializers.IntegerField()
    receita_produtos_mes = serializers.DecimalField(max_digits=10, decimal_places=2)
    taxa_ocupacao_media_30d = serializers.FloatField()
    plano_mais_popular = serializers.CharField(allow_blank=True)
    instrutor_destaque = serializers.CharField(allow_blank=True)

class DashboardSerializer(serializers.Serializer):
    """Serializer principal que agrega todos os dados."""
    financeiro = FinanceiroDashboardSerializer()
    agendamentos = AgendamentosDashboardSerializer()
    usuarios = UsuariosDashboardSerializer()
    alertas = AlertasDashboardSerializer()
    total_studios_ativos = serializers.IntegerField()
    insights_estrategicos = InsightsEstrategicosSerializer()
