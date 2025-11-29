from django.urls import path
from .views import (
    RelatorioFaturamentoView,
    RelatorioVendasProdutoView,
    RelatorioStatusPagamentosView,
    RelatorioMatriculasAtivasView,
)

urlpatterns = [
    path('faturamento/', RelatorioFaturamentoView.as_view(), name='relatorio-faturamento'),
    path('vendas-por-produto/', RelatorioVendasProdutoView.as_view(), name='relatorio-vendas-produto'),
    path('status-pagamentos/', RelatorioStatusPagamentosView.as_view(), name='relatorio-status-pagamentos'),
    path('matriculas-ativas/', RelatorioMatriculasAtivasView.as_view(), name='relatorio-matriculas-ativas'),
]
