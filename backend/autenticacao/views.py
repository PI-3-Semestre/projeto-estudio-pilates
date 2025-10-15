# autenticacao/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from .serializers import CustomTokenObtainPairSerializer
from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=['Autenticação'],
    description='''
Endpoint para Autenticação de Usuários.

Fornece o endpoint para:
- Realizar o login no sistema.

Recebe `username` e `password` e retorna os tokens de acesso (`access`, `refresh`) e os dados do perfil do usuário.

**Nota:** Este endpoint tem acesso público.
'''
)
class LoginAPIView(TokenObtainPairView):
    """
    View de Login que utiliza o serializer customizado para retornar
    o token junto com os dados de perfil e permissões do usuário.
    """
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer