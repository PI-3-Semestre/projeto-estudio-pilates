from rest_framework.permissions import BasePermission
from .models import Colaborador

class IsAdminMaster(BasePermission):
    """
    Permissão customizada que permite acesso apenas a usuários com perfil 
    de 'ADMIN_MASTER'.
    """
    message = "Apenas usuários com perfil de Admin Master podem realizar esta ação."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True

        try:
            return request.user.colaborador.perfis.filter(
                nome='ADMIN_MASTER'
            ).exists()
        except Colaborador.DoesNotExist:
            return False

class IsAdminMasterOrAdministrador(BasePermission):
    """
    Permissão customizada que permite acesso apenas a usuários com perfis 
    de 'ADMIN_MASTER' ou 'ADMINISTRADOR'.
    """
    message = "Apenas usuários com perfil de Admin Master ou Administrador podem realizar esta ação."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True

        try:
            # Verifica se o colaborador tem algum dos perfis necessários.
            return request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR']
            ).exists()
        except Colaborador.DoesNotExist:
            return False