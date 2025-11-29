# backend/autenticacao/auth_backends.py

from django.contrib.auth.backends import ModelBackend
from usuarios.models import Usuario

# Django permite uma lista de "backends" de autenticação. Ele tenta cada um em ordem
# até que um deles retorne um objeto de usuário com sucesso.

class CPFBackend(ModelBackend):
    """
    Backend de autenticação customizado que permite o login de usuários
    utilizando o CPF no campo 'username' da requisição de login.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # O simple-jwt envia o identificador (seja username, email ou cpf) 
        # sempre no parâmetro 'username'.
        cpf = username
        if not cpf:
            return None

        users = Usuario.objects.filter(cpf=cpf, is_active=True)
        
        # Se encontrou exatamente um usuário, prossiga com a verificação da senha.
        if users.count() == 1:
            user = users.first()
            if user.check_password(password):
                return user
        
        # Se a autenticação não foi bem-sucedida (nenhum usuário, múltiplos usuários ou senha incorreta),
        # falha silenciosamente para que o Django possa tentar outros backends.
        return None

class EmailBackend(ModelBackend):
    """
    Backend de autenticação customizado que permite o login de usuários
    utilizando o email no campo 'username' da requisição de login.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = username
        try:
            # Tenta encontrar um usuário ativo cujo email corresponda (ignorando maiúsculas/minúsculas).
            user = Usuario.objects.get(email__iexact=email, is_active=True)
        except Usuario.DoesNotExist:
            # Se nenhum usuário for encontrado, falha silenciosamente.
            return None

        # Se o usuário foi encontrado, verifica a senha.
        if user.check_password(password):
            # Se a senha estiver correta, retorna o usuário.
            return user
        
        # Se a senha estiver incorreta, a autenticação falha.
        return None