# financeiro/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PagamentoViewSet,
    EstoqueAjusteView,
    EstoquePorStudioView,
    EstoquePorProdutoView,
)

router = DefaultRouter()
router.register(r'pagamentos', PagamentoViewSet, basename='pagamento')

urlpatterns = [
    path('', include(router.urls)),
    # Rotas de Estoque
    path('estoque/ajustar/', EstoqueAjusteView.as_view(), name='ajustar-estoque'),
    path('estoque/studio/<int:studio_id>/', EstoquePorStudioView.as_view(), name='estoque-por-studio'),
    path('estoque/produto/<int:produto_id>/', EstoquePorProdutoView.as_view(), name='estoque-por-produto'),
]
