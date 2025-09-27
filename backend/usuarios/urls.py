# backend/usuarios/urls.py

from django.urls import path
from .views import LoginView, CurrentUserView # Adicione CurrentUserView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Rotas existentes
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- Adicione esta nova linha para a rota do usuário ---
    path('me/', CurrentUserView.as_view(), name='current_user'),
]