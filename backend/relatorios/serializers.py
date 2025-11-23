from rest_framework import serializers

# --- Serializers para os dados de saída dos relatórios ---

class FaturamentoMensalSerializer(serializers.Serializer):
    """ Sub-serializer para o detalhamento mensal do faturamento. """
    mes = serializers.CharField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)

class RelatorioFaturamentoSerializer(serializers.Serializer):
    """ Serializer para o Relatório de Faturamento. """
    data_inicio = serializers.DateField()
    data_fim = serializers.DateField()
    studio_id = serializers.IntegerField(required=False, allow_null=True)
    faturamento_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    faturamento_mensal = FaturamentoMensalSerializer(many=True)


class VendaProdutoDetalheSerializer(serializers.Serializer):
    """ Sub-serializer para os detalhes de vendas por produto. """
    produto_id = serializers.IntegerField()
    produto_nome = serializers.CharField()
    quantidade_vendida = serializers.IntegerField()
    valor_total_gerado = serializers.DecimalField(max_digits=12, decimal_places=2)

class RelatorioVendasProdutoSerializer(serializers.Serializer):
    """ Serializer para o Relatório de Vendas por Produto. """
    data_inicio = serializers.DateField()
    data_fim = serializers.DateField()
    studio_id = serializers.IntegerField(required=False, allow_null=True)
    produtos = VendaProdutoDetalheSerializer(many=True)


class StatusPagamentoDetalheSerializer(serializers.Serializer):
    """ Sub-serializer para os detalhes de status de pagamentos. """
    status = serializers.CharField()
    quantidade = serializers.IntegerField()
    valor_total = serializers.DecimalField(max_digits=12, decimal_places=2)

class RelatorioStatusPagamentosSerializer(serializers.Serializer):
    """ Serializer para o Relatório de Status de Pagamentos. """
    data_inicio = serializers.DateField()
    data_fim = serializers.DateField()
    studio_id = serializers.IntegerField(required=False, allow_null=True)
    status_pagamentos = StatusPagamentoDetalheSerializer(many=True)


class MatriculasPlanoDetalheSerializer(serializers.Serializer):
    """ Sub-serializer para os detalhes de matrículas por plano. """
    plano_id = serializers.IntegerField()
    plano_nome = serializers.CharField()
    quantidade_ativas = serializers.IntegerField()

class RelatorioMatriculasAtivasSerializer(serializers.Serializer):
    """ Serializer para o Relatório de Matrículas Ativas. """
    studio_id = serializers.IntegerField(required=False, allow_null=True)
    total_matriculas_ativas = serializers.IntegerField()
    detalhes_por_plano = MatriculasPlanoDetalheSerializer(many=True)
