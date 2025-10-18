# alunos/permissions.py
from rest_framework import permissions
from usuarios.models import Colaborador

class IsAdminOrRecepcionista(permissions.BasePermission):
    """
    Permissão customizada para permitir acesso a Admins ou Recepcionistas.
    """
    message = "Apenas usuários com perfil de Administrador ou Recepcionista podem realizar esta ação."

    def has_permission(self, request, view):
        # Permissão de leitura é permitida para qualquer usuário autenticado.
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Permissão de escrita (POST, PUT, DELETE) é permitida apenas para admins ou recepcionistas.
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
            
        try:
            # Verifica se o colaborador tem algum dos perfis necessários.
            return request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
            ).exists()
        except Colaborador.DoesNotExist:
            # O usuário não tem um perfil de colaborador
            return False