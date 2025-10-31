# autenticacao/views.py

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny
from .serializers import CustomTokenObtainPairSerializer
from drf_spectacular.utils import extend_schema

@extend_schema(
    summary="Realiza o login e retorna tokens de acesso/atualização",
    tags=['Autenticação'],
    description='''
Endpoint para Autenticação de Usuários.

Fornece o endpoint para realizar o login no sistema.

Recebe um identificador (`username`, `cpf` ou `email`) e `password` e retorna os tokens de acesso (`access`, `refresh`) e os dados do perfil do usuário, se aplicável.

**Nota:** Este endpoint tem acesso público.
'''
)
class LoginAPIView(TokenObtainPairView):
    """
    View de Login customizada.
    
    Herda da view padrão do simple-jwt, mas substitui o serializer padrão
    pelo `CustomTokenObtainPairSerializer` para enriquecer a resposta do login
    com os dados do perfil do usuário.
    """
    # Permite que qualquer usuário, autenticado ou não, acesse este endpoint.
    # Essencial para uma view de login.
    permission_classes = (AllowAny,)
    
    # Especifica o serializer customizado que deve ser usado para validar
    # as credenciais e formatar a resposta do token.
    serializer_class = CustomTokenObtainPairSerializer

@extend_schema(
    tags=['Autenticação'],
    summary="Renova o token de acesso a partir de um refresh token válido",
)
class CustomTokenRefreshView(TokenRefreshView):
    """
    View de Refresh de Token customizada.
    
    Herda da view padrão do simple-jwt e é decorada com `extend_schema`
    para uma melhor documentação da API no drf-spectacular.
    """
    pass
