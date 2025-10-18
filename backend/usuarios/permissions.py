from rest_framework.permissions import BasePermission
from .models import Colaborador

class IsAdminMasterOrAdministrador(BasePermission):
    """
    Permissão customizada que permite acesso apenas a usuários com perfil 
    'ADMIN_MASTER' ou 'ADMINISTRADOR'.
    """
    message = "Apenas usuários com perfil de Admin Master ou Administrador podem realizar esta ação."

    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado
        if not request.user or not request.user.is_authenticated:
            return False

        # Tenta obter o perfil de colaborador associado ao usuário
        try:
            perfil = request.user.colaborador.perfil
        except Colaborador.DoesNotExist:
            # Se o usuário não tem um perfil de colaborador, ele não tem permissão.
            return False

        # Verifica se o perfil é um dos permitidos
        return perfil in [Colaborador.Perfil.ADMIN_MASTER, Colaborador.Perfil.ADMINISTRADOR]
