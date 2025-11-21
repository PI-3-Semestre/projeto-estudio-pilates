"""
Configuração de URLs para o projeto config.

A lista `urlpatterns` roteia URLs para as views. Para mais informações, consulte:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Exemplos:
Views baseadas em função (Function views)
    1. Adicione a importação:  from my_app import views
    2. Adicione uma URL a urlpatterns:  path('', views.home, name='home')
Views baseadas em classe (Class-based views)
    1. Adicione a importação:  from other_app.views import Home
    2. Adicione uma URL a urlpatterns:  path('', Home.as_view(), name='home')
Incluindo outro URLconf (Including another URLconf)
    1. Importe a função include(): from django.urls import include, path
    2. Adicione uma URL a urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# Importar as ViewSets de financeiro.views
from financeiro.views import PlanoViewSet, MatriculaViewSet, ProdutoViewSet, VendaViewSet # Adicionado ProdutoViewSet e VendaViewSet

# Criar roteadores específicos para Planos e Matrículas
planos_router = DefaultRouter()
planos_router.register(r'', PlanoViewSet, basename='plano')

matriculas_router = DefaultRouter()
matriculas_router.register(r'', MatriculaViewSet, basename='matricula')

# Criar roteadores específicos para Produtos e Vendas
produtos_router = DefaultRouter()
produtos_router.register(r'', ProdutoViewSet, basename='produto')

vendas_router = DefaultRouter()
vendas_router.register(r'', VendaViewSet, basename='venda')


urlpatterns = [
    # Rota do Admin Padrão do Django
    path("admin/", admin.site.urls),
    # --- Rotas da Documentação (Swagger) ---
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    # --- Nossas Rotas de API ---
    path('api/agendamentos/', include('agendamentos.urls')),
    path("api/", include("usuarios.urls")),
    path("api/", include("alunos.urls")),
    path("api/studios/", include("studios.urls")),
    path("api/avaliacoes/", include("avaliacoes.urls")),
    path("api/auth/", include("autenticacao.urls")),
    
    # Rotas separadas para Planos e Matrículas
    path('api/planos/', include(planos_router.urls)),
    path('api/matriculas/', include(matriculas_router.urls)),

    # Rotas separadas para Produtos e Vendas
    path('api/produtos/', include(produtos_router.urls)), # Nova rota para Produtos
    path('api/vendas/', include(vendas_router.urls)),     # Nova rota para Vendas

    path('api/financeiro/', include('financeiro.urls')), # O restante do financeiro (Pagamentos)
    path('api/notifications/', include('notifications.urls')),
    path('api/', include('core.urls')), # Rota para o Dashboard
]

# path para salvar as fotos dos alunos
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
