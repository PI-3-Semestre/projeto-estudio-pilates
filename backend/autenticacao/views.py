import resend
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema

from usuarios.models import Usuario
from .models import PasswordResetToken
from .serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

# Configura a API Key do Resend com o valor que está no settings.py
resend.api_key = settings.RESEND_API_KEY

@extend_schema(
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
    description='Solicita a recuperação de senha e envia um Link Mágico por e-mail.'
)
class PasswordResetRequestAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']

        # 1. Busca o usuário (por e-mail ou CPF)
        try:
            user = Usuario.objects.get(Q(email__iexact=identifier) | Q(cpf=identifier), is_active=True)
        except Usuario.DoesNotExist:
            # Retorna sucesso falso por segurança (para não revelar emails cadastrados)
            return Response(
                {"detail": "Se um usuário com este identificador existir, um e-mail foi enviado."},
                status=status.HTTP_200_OK
            )

        # 2. Invalida tokens antigos desse usuário para evitar conflitos
        PasswordResetToken.objects.filter(user=user).delete()
        
        # 3. Cria um novo token (Seu model já gera um hash seguro de 48 chars automaticamente)
        reset_token = PasswordResetToken.objects.create(user=user)

        # 4. Monta o Link Mágico
        # Assumindo que seu frontend roda na porta 3000. Ajuste se necessário.
        # O token vai na URL como um parâmetro GET.
        # MUdar a port caso seja DIFERENTE no frontend
        reset_link = f"http://localhost:5173/recuperar-senha?token={reset_token.token}"

        # 5. Prepara o HTML do E-mail
        html_content = f"""
        <div style="font-family: sans-serif; color: #333;">
            <h2>Recuperação de Senha - Define Pilates</h2>
            <p>Olá, <strong>{user.get_full_name() or 'Aluno'}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="margin: 20px 0;">
                <a href="{reset_link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    REDEFINIR MINHA SENHA
                </a>
            </div>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="color: #666; font-size: 14px;">{reset_link}</p>
            <hr>
            <p style="font-size: 12px; color: #888;">Se você não solicitou isso, apenas ignore este e-mail. O link expira em 15 minutos.</p>
        </div>
        """

        # 6. Envia usando o Resend
        try:
            params = {
                "from": settings.DEFAULT_FROM_EMAIL, # Pega o 'onboarding@resend.dev' do settings
                "to": [user.email],
                "subject": "Redefina sua senha - Define Pilates",
                "html": html_content,
            }
            resend.Emails.send(params)
            
        except Exception as e:
            print(f"ERRO AO ENVIAR E-MAIL RESEND: {e}")
            # Em produção, você pode querer logar isso melhor
            
        return Response(
            {"detail": "Se um usuário com este identificador existir, um e-mail foi enviado."},
            status=status.HTTP_200_OK
        )

@extend_schema(
    tags=['Autenticação'],
    description='Define a nova senha usando o token recebido no link.'
)
class PasswordResetConfirmAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Busca o token no banco
        try:
            token_obj = PasswordResetToken.objects.get(token=data['token'])
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Link inválido ou token incorreto."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Verifica se expirou
        if token_obj.is_expired():
            token_obj.delete()
            return Response({"error": "Este link expirou. Solicite um novo."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Altera a senha do usuário dono do token
        user = token_obj.user
        user.set_password(data['password'])
        user.save()

        # 4. Remove o token usado (para não ser usado 2 vezes)
        token_obj.delete()

        return Response({"detail": "Senha redefinida com sucesso! Agora você pode fazer login."}, status=status.HTTP_200_OK)

