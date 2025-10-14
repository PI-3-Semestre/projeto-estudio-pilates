# alunos/permissions.py
from rest_framework import permissions

class IsAdminOrRecepcionista(permissions.BasePermission):
    """
    Permissão customizada para permitir acesso apenas a Admins ou Recepcionistas.
    """
    def has_permission(self, request, view):
        # Permissão de leitura é permitida para qualquer usuário autenticado.
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Permissão de escrita (POST, PUT, DELETE) é permitida apenas para admins ou recepcionistas.
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verifica se o usuário é superuser/staff ou se tem o perfil de Colaborador adequado
        if request.user.is_superuser or request.user.is_staff:
            return True
            
        try:
            perfil = request.user.colaborador.perfil
            return perfil in ['ADMINISTRADOR', 'RECEPCIONISTA']
        except AttributeError:
            # O usuário não tem um perfil de colaborador
            return False
