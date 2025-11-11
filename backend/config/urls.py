# config/urls.py

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static

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
    
    # --- Nossas Rotas de API (ORGANIZADAS) ---
    # Cada app agora tem seu prefixo claro
    
    path('api/agendamentos/', include('agendamentos.urls')),
    path("api/auth/", include("autenticacao.urls")),
    path("api/avaliacoes/", include("avaliacoes.urls")),
    path('api/financeiro/', include('financeiro.urls')), #
    path("api/studios/", include("studios.urls")),
    
    # --- AJUSTADO ---
    # Adicionamos prefixos únicos para 'usuarios' e 'alunos'
    path("api/usuarios/", include("usuarios.urls")),
    path("api/alunos/", include("alunos.urls")),
]

# path para salvar as fotos dos alunos
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)