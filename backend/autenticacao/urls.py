from django.urls import path
from .views import LoginAPIView, PasswordResetRequestAPIView, PasswordResetConfirmAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Rota para obter o par de tokens (access e refresh) através do login.
    path('login/', LoginAPIView.as_view(), name='token_obtain_pair'),

    # Utiliza a view padrão do simple-jwt, que já tem a lógica necessária.
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Rotas para redefinição de senha
    path('password-reset/', PasswordResetRequestAPIView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmAPIView.as_view(), name='password_reset_confirm'),
]