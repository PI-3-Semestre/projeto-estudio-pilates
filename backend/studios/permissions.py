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
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True
        
        try:
            return request.user.colaborador.perfis.filter(
                nome='ADMIN_MASTER'
            ).exists()
        except Colaborador.DoesNotExist:
            return False


class IsStudioAdminOrAdminMaster(BasePermission):
    """
    Permissão customizada que permite acesso a:
    - ADMIN_MASTER: Acesso total.
    - Administradores de um Studio: Acesso total ao seu próprio studio.
    """
    message = "Você não tem permissão para acessar o dashboard deste estúdio."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        try:
            colaborador = request.user.colaborador
            if colaborador.perfis.filter(nome='ADMIN_MASTER').exists():
                return True
        except Colaborador.DoesNotExist:
            pass
        
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        
        try:
            colaborador = request.user.colaborador
            if colaborador.perfis.filter(nome='ADMIN_MASTER').exists():
                return True
            
            if colaborador.perfis.filter(nome='ADMINISTRADOR').exists() and obj in colaborador.unidades.all():
                return True
        except Colaborador.DoesNotExist:
            pass
        
        return False
