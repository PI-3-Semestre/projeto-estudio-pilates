# autenticacao/urls.py

from django.urls import path
from .views import LoginAPIView, CustomTokenRefreshView

urlpatterns = [
    # Rota para obter o par de tokens (access e refresh) através do login.
    # Usa a nossa view customizada `LoginAPIView` para incluir dados do usuário na resposta.
    # O `name` 'token_obtain_pair' é o nome padrão esperado por muitas integrações do simple-jwt.
    path('login/', LoginAPIView.as_view(), name='token_obtain_pair'),
    
    # Rota para obter um novo token de acesso usando um token de refresh válido.
    # Utiliza a view customizada `CustomTokenRefreshView` que é decorada com `extend_schema`.
    path(
        'token/refresh/',
        CustomTokenRefreshView.as_view(),
        name='token_refresh'
    ),
]
