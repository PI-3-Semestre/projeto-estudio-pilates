# backend/usuarios/auth_backends.py

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

class CPFOrEmailBackend(ModelBackend):
    """
    Este é um backend de autenticação customizado que permite aos usuários
    fazerem login usando seu CPF ou seu endereço de e-mail no campo 'username'.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Procura por um usuário que tenha o CPF ou o e-mail correspondente
            # ao que foi passado no campo 'username'.
            user = UserModel.objects.get(Q(cpf__iexact=username) | Q(email__iexact=username))
        except UserModel.DoesNotExist:
            # Se nenhum usuário for encontrado, a autenticação falha.
            return None

        # Verifica se a senha fornecida está correta
        if user.check_password(password):
            return user
        
        # Se a senha estiver incorreta, a autenticação falha.
        return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None