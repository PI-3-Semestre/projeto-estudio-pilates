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
    MinhasMatriculasListView, 
    MeusPagamentosListView,   
)

router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'pagamentos', PagamentoViewSet, basename='pagamento')

urlpatterns = [
    # Rotas para o Aluno (devem vir antes do include(router.urls))
    path('matriculas/me/', MinhasMatriculasListView.as_view(), name='minhas-matriculas'),
    path('pagamentos/me/', MeusPagamentosListView.as_view(), name='meus-pagamentos'),
    
    path('', include(router.urls)),
    # Rota customizada de Produtos
    path('produtos/studio/<int:studio_id>/', ProdutosPorStudioView.as_view(), name='produtos-por-studio'),
    # Rotas de Estoque
    path('estoque/ajustar/', EstoqueAjusteView.as_view(), name='ajustar-estoque'),
    path('estoque/studio/<int:studio_id>/', EstoquePorStudioView.as_view(), name='estoque-por-studio'),
    path('estoque/produto/<int:produto_id>/', EstoquePorProdutoView.as_view(), name='estoque-por-produto'),
]
