# studios/serializers.py
from rest_framework import serializers
from .models import Studio
from financeiro.models import Matricula, Venda, EstoqueStudio, Pagamento
from avaliacoes.models import Avaliacao
from agendamentos.models import AulaAluno

class StudioSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Studio.
    
    Responsável por converter os dados do modelo Studio para JSON (serialização)
    e por validar os dados de entrada ao criar ou atualizar um studio (desserialização).
    """
    class Meta:
        model = Studio
        
        # Define os campos do modelo que serão expostos na API.
        # Listar os campos explicitamente é uma boa prática de segurança.
        fields = ['id', 'nome', 'endereco']


class FinanceiroDashboardSerializer(serializers.Serializer):
    total_matriculas = serializers.IntegerField()
    total_vendas = serializers.IntegerField()
    total_pagamentos_pendentes = serializers.IntegerField()
    total_pagamentos_atrasados = serializers.IntegerField()


class AvaliacaoDashboardSerializer(serializers.Serializer):
    total_avaliacoes = serializers.IntegerField()


class AgendamentoDashboardSerializer(serializers.Serializer):
    total_agendamentos_hoje = serializers.IntegerField()
    total_agendamentos_pendentes = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    studio_id = serializers.IntegerField()
    studio_name = serializers.CharField()
    financeiro = FinanceiroDashboardSerializer()
    avaliacoes = AvaliacaoDashboardSerializer()
    agendamentos = AgendamentoDashboardSerializer()
