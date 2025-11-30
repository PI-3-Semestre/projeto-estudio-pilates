# avaliacoes/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from usuarios.models import Colaborador

class IsAluno(BasePermission):
    """
    Permissão customizada que verifica se o usuário logado possui um perfil de Aluno.
    """
    message = "Apenas usuários com perfil de aluno podem acessar esta funcionalidade."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'aluno')

class CanManageAvaliacaoObject(BasePermission):
    """
    Permissão customizada para o gerenciamento de Avaliações.
    - Admin Master/Administrador: Acesso total.
    - Fisioterapeuta/Instrutor: Acesso total às avaliações que criou.
    - Recepcionista: Apenas leitura dos detalhes.
    """
    message = "Você não tem permissão para realizar esta ação."

    def has_permission(self, request, view):
        """Define o acesso a nível de view (POST para criar, GET para listar)."""
        if request.user and request.user.is_superuser:
            return True
            
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
        except Colaborador.DoesNotExist:
            return False

        if request.method == 'POST':
            return any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'FISIOTERAPEUTA', 'INSTRUTOR'] for perfil in user_perfis)

        return True

    def has_object_permission(self, request, view, obj):
        """Define o acesso a nível de objeto (GET, PUT, DELETE em uma avaliação específica)."""
        if request.user and request.user.is_superuser:
            return True
            
        try:
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
        except Colaborador.DoesNotExist:
            return False

        if 'ADMIN_MASTER' in user_perfis or 'ADMINISTRADOR' in user_perfis:
            return True

        if 'FISIOTERAPEUTA' in user_perfis or 'INSTRUTOR' in user_perfis:
            return obj.instrutor == request.user.colaborador

        if 'RECEPCIONISTA' in user_perfis:
            return request.method in SAFE_METHODS
        return False
