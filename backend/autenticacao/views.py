# autenticacao/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from .serializers import CustomTokenObtainPairSerializer
from drf_spectacular.utils import extend_schema

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


from rest_framework import generics, status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.db.models import Q
from usuarios.models import Usuario
from .models import PasswordResetToken
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

@extend_schema(
    tags=['Autenticação'],
    description='''
Endpoint para solicitar a redefinição de senha.

Recebe um identificador (`email` ou `cpf`) e, se o usuário existir, envia um token de redefinição para o seu e-mail.
'''
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
            # Não revela se o usuário existe ou não
            return Response(
                {"detail": "Se um usuário com este identificador existir, um e-mail de redefinição foi enviado."},
                status=status.HTTP_200_OK
            )

        # Invalida tokens antigos antes de criar um novo
        PasswordResetToken.objects.filter(user=user).delete()
        
        reset_token = PasswordResetToken.objects.create(user=user)

        # Envio de e-mail
        context = {'token': reset_token.token}
        html_message = render_to_string('autenticacao/password_reset_email.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Redefinição de Senha - Define Pilates',
            message=plain_message,
            from_email=None,  # Usa o DEFAULT_FROM_EMAIL de settings.py
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )

        return Response(
            {"detail": "Se um usuário com este identificador existir, um e-mail de redefinição foi enviado."},
            status=status.HTTP_200_OK
        )

@extend_schema(
    tags=['Autenticação'],
    description='''
Endpoint para confirmar a redefinição de senha.

Recebe o token enviado por e-mail e a nova senha para efetivar a alteração.
'''
)
class PasswordResetConfirmAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            token = PasswordResetToken.objects.get(token=data['token'])
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if token.is_expired():
            token.delete()
            return Response({"error": "Token expirado."}, status=status.HTTP_400_BAD_REQUEST)

        user = token.user
        user.set_password(data['password'])
        user.save()

        token.delete()

        return Response({"detail": "Senha redefinida com sucesso."}, status=status.HTTP_200_OK)

