# backend/autenticacao/auth_backends.py

from django.contrib.auth.backends import ModelBackend
from usuarios.models import Usuario  # Garanta que seu modelo de usuário está importado

class CPFBackend(ModelBackend):
    """
    Backend de autenticação customizado que permite o login de usuários
    utilizando o seu CPF.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # O DRF/SimpleJWT envia o identificador no parâmetro 'username',
        # que para esta regra, deve conter o CPF.
        cpf = username
        try:
            # Procuramos por um usuário cujo CPF corresponda exatamente
            # ao que foi fornecido.
            user = Usuario.objects.get(cpf=cpf)
        except Usuario.DoesNotExist:
            # Se nenhum usuário for encontrado com este CPF, a autenticação falha.
            return None

        # Se o usuário foi encontrado, verificamos se a senha fornecida está correta.
        if user.check_password(password):
            # Se a senha estiver correta, retornamos o objeto do usuário.
            return user
        
        # Se a senha estiver incorreta, a autenticação falha.
        return None

class EmailBackend(ModelBackend):
    """
    Backend de autenticação customizado que permite o login de usuários
    utilizando apenas o seu endereço de email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # O DRF/SimpleJWT envia o identificador no parâmetro 'username',
        # mas, para nossa regra, ele deve conter o email.
        email = username

        try:
            # Procuramos por um usuário cujo email corresponda exatamente
            # ao que foi fornecido (ignorando maiúsculas/minúsculas).
            user = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist:
            # Se nenhum usuário for encontrado com este email, a autenticação falha.
            return None

        # Se o usuário foi encontrado, verificamos se a senha fornecida está correta.
        if user.check_password(password):
            # Se a senha estiver correta, retornamos o objeto do usuário.
            return user
        
        # Se a senha estiver incorreta, a autenticação falha.
        return None
