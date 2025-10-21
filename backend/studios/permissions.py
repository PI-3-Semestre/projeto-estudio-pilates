from rest_framework.permissions import BasePermission, SAFE_METHODS
from usuarios.models import Colaborador

class IsAdminMasterOrReadOnly(BasePermission):
    """
    Permissão customizada que permite acesso de escrita (criação, edição, deleção)
    apenas para usuários com o perfil de ADMIN_MASTER.
    
    Para outros usuários autenticados, o acesso é de somente-leitura (GET, HEAD, OPTIONS).
    """
    message = "Apenas usuários com perfil de Admin Master podem criar ou modificar studios."

    def has_permission(self, request, view):
        # Nega acesso se o usuário não estiver autenticado.
        if not request.user or not request.user.is_authenticated:
            return False

        # Permite acesso de leitura para qualquer usuário autenticado.
        if request.method in SAFE_METHODS:
            return True

        # A partir daqui, a requisição é de escrita (POST, PUT, PATCH, DELETE).
        # Permite acesso de escrita apenas para superusuários ou ADMIN_MASTER.
        if request.user.is_superuser:
            return True
        
        try:
            return request.user.colaborador.perfis.filter(
                nome='ADMIN_MASTER'
            ).exists()
        except Colaborador.DoesNotExist:
            return False
