# financeiro/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProdutoViewSet,
    PagamentoViewSet,
    EstoqueAjusteView,
    EstoquePorStudioView,
    EstoquePorProdutoView,
    ProdutosPorStudioView,
)

router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'pagamentos', PagamentoViewSet, basename='pagamento')

urlpatterns = [
    path('', include(router.urls)),
    # Rota customizada de Produtos
    path('produtos/studio/<int:studio_id>/', ProdutosPorStudioView.as_view(), name='produtos-por-studio'),
    # Rotas de Estoque
    path('estoque/ajustar/', EstoqueAjusteView.as_view(), name='ajustar-estoque'),
    path('estoque/studio/<int:studio_id>/', EstoquePorStudioView.as_view(), name='estoque-por-studio'),
    path('estoque/produto/<int:produto_id>/', EstoquePorProdutoView.as_view(), name='estoque-por-produto'),
]
