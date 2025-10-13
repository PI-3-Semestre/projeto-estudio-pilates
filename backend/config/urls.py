# backend/config/urls.py

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Rotas padrão do Django
    path('admin/', admin.site.urls),

    # Rotas dos seus aplicativos
    path('usuarios/', include('usuarios.urls')),
    path('auth/', include('autenticacao.urls')),

    # Rotas da Documentação da API (Swagger)
    # ------------------------------------------------
    # Rota para gerar o arquivo schema.yml (os dados brutos da API)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # Rota para a interface visual do Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Rota opcional para a documentação Redoc
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    # ------------------------------------------------
]