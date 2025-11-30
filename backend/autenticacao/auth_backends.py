# backend/autenticacao/auth_backends.py

from django.contrib.auth.backends import ModelBackend
from usuarios.models import Usuario

class CPFBackend(ModelBackend):
    """
    Backend de autenticação customizado que permite o login de usuários
    utilizando o CPF no campo 'username' da requisição de login.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        cpf = username
        if not cpf:
            return None

        users = Usuario.objects.filter(cpf=cpf, is_active=True)
        
        if users.count() == 1:
            user = users.first()
            if user.check_password(password):
                return user
        
        return None

class EmailBackend(ModelBackend):
    """
    Backend de autenticação customizado que permite o login de usuários
    utilizando o email no campo 'username' da requisição de login.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = username
        try:
            user = Usuario.objects.get(email__iexact=email, is_active=True)
        except Usuario.DoesNotExist:
            return None

        if user.check_password(password):
            return user
        
        return None