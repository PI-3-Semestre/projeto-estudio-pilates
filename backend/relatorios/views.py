from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.db.models import Sum, Count, F, Q
from django.db.models.functions import TruncMonth

from financeiro.models import Pagamento, Venda, VendaProduto, Matricula, Plano
from financeiro.permissions import IsAdminFinanceiro
from .serializers import (
    RelatorioFaturamentoSerializer,
    RelatorioVendasProdutoSerializer,
    RelatorioStatusPagamentosSerializer,
    RelatorioMatriculasAtivasSerializer,
)
from datetime import date, timedelta


# Funções auxiliares para reduzir a duplicação de código
def get_date_range_from_params(request):
    """
    Extrai e valida as datas de início e fim dos parâmetros da requisição.
    Retorna uma tupla (data_inicio, data_fim).
    Lança ValueError se o formato da data for inválido.
    """
    data_inicio_str = request.query_params.get('data_inicio')
    data_fim_str = request.query_params.get('data_fim')

    data_inicio = date.fromisoformat(data_inicio_str) if data_inicio_str else date.today() - timedelta(days=365)
    data_fim = date.fromisoformat(data_fim_str) if data_fim_str else date.today()
    
    return data_inicio, data_fim

def filter_pagamentos_by_studio(queryset, studio_id):
    """Aplica filtro de studio a um queryset de Pagamento."""
    if studio_id:
        return queryset.filter(
            Q(matricula__studio_id=studio_id) | Q(venda__studio_id=studio_id)
        )
    return queryset


@extend_schema(
    tags=['Relatórios'],
    summary="Relatório de Faturamento Total e Mensal",
    description="Fornece um resumo do faturamento total e um detalhamento mensal dos pagamentos recebidos.",
    parameters=[
        OpenApiParameter(name='data_inicio', description='Data de início (YYYY-MM-DD)', type=str),
        OpenApiParameter(name='data_fim', description='Data de fim (YYYY-MM-DD)', type=str),
        OpenApiParameter(name='studio_id', description='ID do Studio para filtrar os resultados', type=int),
    ]
)
class RelatorioFaturamentoView(APIView):
    permission_classes = [IsAdminFinanceiro]

    def get(self, request):
        studio_id = request.query_params.get('studio_id')
        try:
            data_inicio, data_fim = get_date_range_from_params(request)
        except ValueError:
            return Response({"error": "Formato de data inválido. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = Pagamento.objects.filter(
            status='PAGO',
            data_pagamento__range=[data_inicio, data_fim]
        )

        queryset = filter_pagamentos_by_studio(queryset, studio_id)

        faturamento_total = queryset.aggregate(total=Sum('valor_total'))['total'] or 0

        faturamento_mensal = (
            queryset
            .annotate(mes=TruncMonth('data_pagamento'))
            .values('mes')
            .annotate(total=Sum('valor_total'))
            .order_by('mes')
        )

        serializer_data = {
            'data_inicio': data_inicio,
            'data_fim': data_fim,
            'studio_id': studio_id,
            'faturamento_total': faturamento_total,
            'faturamento_mensal': [
                {'mes': item['mes'].strftime('%Y-%m'), 'total': item['total']}
                for item in faturamento_mensal
            ]
        }
        
        serializer = RelatorioFaturamentoSerializer(data=serializer_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

@extend_schema(
    tags=['Relatórios'],
    summary="Relatório de Vendas por Produto",
    description="Mostra a quantidade vendida e o valor total gerado por cada produto.",
    parameters=[
        OpenApiParameter(name='data_inicio', description='Data de início (YYYY-MM-DD)', type=str),
        OpenApiParameter(name='data_fim', description='Data de fim (YYYY-MM-DD)', type=str),
        OpenApiParameter(name='studio_id', description='ID do Studio para filtrar os resultados', type=int),
    ]
)
class RelatorioVendasProdutoView(APIView):
    permission_classes = [IsAdminFinanceiro]

    def get(self, request):
        studio_id = request.query_params.get('studio_id')
        try:
            data_inicio, data_fim = get_date_range_from_params(request)
        except ValueError:
            return Response({"error": "Formato de data inválido. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = VendaProduto.objects.filter(
            venda__data_venda__range=[data_inicio, data_fim]
        )

        if studio_id:
            queryset = queryset.filter(venda__studio_id=studio_id)

        vendas_por_produto = (
            queryset
            .values('produto__id', 'produto__nome')
            .annotate(
                quantidade_vendida=Sum('quantidade'),
                valor_total_gerado=Sum(F('quantidade') * F('preco_unitario'))
            )
            .order_by('-valor_total_gerado')
        )

        serializer_data = {
            'data_inicio': data_inicio,
            'data_fim': data_fim,
            'studio_id': studio_id,
            'produtos': [
                {
                    'produto_id': item['produto__id'],
                    'produto_nome': item['produto__nome'],
                    'quantidade_vendida': item['quantidade_vendida'],
                    'valor_total_gerado': item['valor_total_gerado']
                }
                for item in vendas_por_produto
            ]
        }

        serializer = RelatorioVendasProdutoSerializer(data=serializer_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

@extend_schema(
    tags=['Relatórios'],
    summary="Relatório de Status de Pagamentos",
    description="Acompanha a situação dos pagamentos (inadimplência).",
    parameters=[
        OpenApiParameter(name='data_inicio', description='Data de vencimento inicial (YYYY-MM-DD)', type=str),
        OpenApiParameter(name='data_fim', description='Data de vencimento final (YYYY-MM-DD)', type=str),
        OpenApiParameter(name='studio_id', description='ID do Studio para filtrar os resultados', type=int),
    ]
)
class RelatorioStatusPagamentosView(APIView):
    permission_classes = [IsAdminFinanceiro]

    def get(self, request):
        studio_id = request.query_params.get('studio_id')
        try:
            data_inicio, data_fim = get_date_range_from_params(request)
        except ValueError:
            return Response({"error": "Formato de data inválido. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = Pagamento.objects.filter(
            data_vencimento__range=[data_inicio, data_fim]
        )

        queryset = filter_pagamentos_by_studio(queryset, studio_id)

        status_pagamentos = (
            queryset
            .values('status')
            .annotate(
                quantidade=Count('id'),
                valor_total=Sum('valor_total')
            )
            .order_by('status')
        )

        serializer_data = {
            'data_inicio': data_inicio,
            'data_fim': data_fim,
            'studio_id': studio_id,
            'status_pagamentos': list(status_pagamentos)
        }

        serializer = RelatorioStatusPagamentosSerializer(data=serializer_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

@extend_schema(
    tags=['Relatórios'],
    summary="Relatório de Matrículas Ativas",
    description="Mostra quantos alunos estão ativos em cada plano.",
    parameters=[
        OpenApiParameter(name='studio_id', description='ID do Studio para filtrar os resultados', type=int),
    ]
)
class RelatorioMatriculasAtivasView(APIView):
    permission_classes = [IsAdminFinanceiro]

    def get(self, request):
        studio_id = request.query_params.get('studio_id')
        hoje = date.today()

        queryset = Matricula.objects.filter(
            data_inicio__lte=hoje,
            data_fim__gte=hoje
        )

        if studio_id:
            queryset = queryset.filter(studio_id=studio_id)

        total_ativas = queryset.count()

        detalhes_por_plano = (
            queryset
            .values('plano__id', 'plano__nome')
            .annotate(quantidade_ativas=Count('id'))
            .order_by('-quantidade_ativas')
        )

        serializer_data = {
            'studio_id': studio_id,
            'total_matriculas_ativas': total_ativas,
            'detalhes_por_plano': [
                {
                    'plano_id': item['plano__id'],
                    'plano_nome': item['plano__nome'],
                    'quantidade_ativas': item['quantidade_ativas']
                }
                for item in detalhes_por_plano
            ]
        }

        serializer = RelatorioMatriculasAtivasSerializer(data=serializer_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
