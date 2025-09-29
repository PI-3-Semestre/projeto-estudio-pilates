 #18-login-backend
# backend/config/urls.py

from django.contrib import admin
from django.urls import path, include  # <-- Certifique-se de que 'include' está importado

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
 

urlpatterns = [
    # Rota do Admin Padrão do Django
    path("admin/", admin.site.urls),
 #18-login-backend
    # Adicione esta linha abaixo
    path("api/auth/", include("usuarios.urls")), 


    # --- Rotas da Documentação (Swagger) ---
    # Rota que gera o arquivo de schema da API (necessário para o Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # Rota que serve a interface gráfica do Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # --- Nossas Rotas de API ---
    # Inclui todas as rotas definidas no arquivo 'urls.py' do app 'usuarios'
    
    # TODO: Adicionar as rotas das outras apps aqui no futuro. Exemplo:
    # path('api/', include('agendamentos.urls')),
 
]