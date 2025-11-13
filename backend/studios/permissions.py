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
        
        # Admin Master tem acesso total
        if request.user.is_superuser:
            return True
        
        try:
            colaborador = request.user.colaborador
            if colaborador.perfis.filter(nome='ADMIN_MASTER').exists():
                return True
        except Colaborador.DoesNotExist:
            pass
        
        # Para outros, a permissão é verificada no nível do objeto
        return True

    def has_object_permission(self, request, view, obj):
        # obj é a instância do Studio
        if request.user.is_superuser:
            return True
        
        try:
            colaborador = request.user.colaborador
            # Se o colaborador é um administrador e está associado a este studio
            if colaborador.perfis.filter(nome='ADMINISTRADOR').exists() and obj in colaborador.unidades.all():
                return True
        except Colaborador.DoesNotExist:
            pass
        
        return False
