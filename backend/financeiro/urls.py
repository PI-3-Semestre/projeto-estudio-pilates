# financeiro/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlanoViewSet,
    MatriculaViewSet,
    PagamentoViewSet,
    ProdutoViewSet,
    VendaViewSet
)

router = DefaultRouter()
router.register(r'planos', PlanoViewSet, basename='plano')
router.register(r'matriculas', MatriculaViewSet, basename='matricula')
router.register(r'pagamentos', PagamentoViewSet, basename='pagamento')
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'vendas', VendaViewSet, basename='venda')

urlpatterns = [
    path('', include(router.urls)),
]
