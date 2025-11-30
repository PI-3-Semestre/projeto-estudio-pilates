import resend
import os
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
    permission_classes = (AllowAny,)
    
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

        try:
            user = Usuario.objects.get(Q(email__iexact=identifier) | Q(cpf=identifier), is_active=True)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Se um usuário com este identificador existir, um e-mail foi enviado."},
                status=status.HTTP_200_OK
            )

        PasswordResetToken.objects.filter(user=user).delete()
        reset_token = PasswordResetToken.objects.create(user=user)

        base_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
        
        reset_link = f"{base_url}/password-reset-confirm/{reset_token.token}"

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

        try:
            resend.api_key = os.environ.get('RESEND_API_KEY')

            params = {
                "from": "onboarding@resend.dev", 
                "to": [user.email],
                "subject": "Redefina sua senha - Define Pilates",
                "html": html_content, 
            }
            
            email_sent = resend.Emails.send(params)
            print("Resend Response:", email_sent)
            
        except Exception as e:
            print(f"ERRO AO ENVIAR E-MAIL RESEND: {e}")
            
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

        try:
            token_obj = PasswordResetToken.objects.get(token=data['token'])
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Link inválido ou token incorreto."}, status=status.HTTP_400_BAD_REQUEST)

        if token_obj.is_expired():
            token_obj.delete()
            return Response({"error": "Este link expirou. Solicite um novo."}, status=status.HTTP_400_BAD_REQUEST)

        user = token_obj.user
        user.set_password(data['password'])
        user.save()
        token_obj.delete()

        return Response({"detail": "Senha redefinida com sucesso! Agora você pode fazer login."}, status=status.HTTP_200_OK)

