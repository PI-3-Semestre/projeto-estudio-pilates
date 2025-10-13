# autenticacao/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from .serializers import CustomTokenObtainPairSerializer

class LoginAPIView(TokenObtainPairView):
    """
    View de Login que utiliza o serializer customizado para retornar
    o token junto com os dados de perfil e permissões do usuário.
    """
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer