# financeiro/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PagamentoViewSet,
    # ProdutoViewSet, <-- Removido
    # VendaViewSet <-- Removido
)

router = DefaultRouter()
router.register(r'pagamentos', PagamentoViewSet, basename='pagamento')
# router.register(r'produtos', ProdutoViewSet, basename='produto') <-- Removido
# router.register(r'vendas', VendaViewSet, basename='venda') <-- Removido

urlpatterns = [
    path('', include(router.urls)),
]
