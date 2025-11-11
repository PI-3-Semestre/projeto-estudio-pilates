# financeiro/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Cria um router padrão
router = DefaultRouter()

# Registra as ViewSets da sua aplicação
# O router gera automaticamente as URLs (GET, POST, PUT, DELETE, etc.)
router.register(r'planos', views.PlanoViewSet)
router.register(r'matriculas', views.MatriculaViewSet)
router.register(r'pagamentos', views.PagamentoViewSet)
router.register(r'produtos', views.ProdutoViewSet)
router.register(r'vendas', views.VendaViewSet)

# As URLs da API são agora determinadas automaticamente pelo router
urlpatterns = [
    path('', include(router.urls)),
]