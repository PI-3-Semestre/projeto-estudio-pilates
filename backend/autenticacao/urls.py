# autenticacao/urls.py

from django.urls import path
from .views import LoginAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Rota para o login, que agora usa nossa view customizada
    path('login/', LoginAPIView.as_view(), name='token_obtain_pair'),
    
    # Rota para atualizar o token de acesso (mantém a padrão)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]