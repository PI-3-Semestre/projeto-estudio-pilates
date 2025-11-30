# alunos/permissions.py
from rest_framework import permissions
from usuarios.models import Colaborador

class IsAdminOrRecepcionista(permissions.BasePermission):
    """
    Permissão customizada para permitir acesso a Admins ou Recepcionistas.
    Permite leitura e escrita APENAS para colaboradores com perfis específicos.
    """
    message = "Apenas usuários com perfil de Administrador ou Recepcionista podem realizar esta ação."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
            
        try:
            return request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
            ).exists()
        except Colaborador.DoesNotExist:
            return False

STAFF_ROLES_PERMITIDOS = {
    'ADMIN_MASTER', 
    'ADMINISTRADOR', 
    'RECEPCIONISTA'
}

class IsStaffAutorizado(permissions.BasePermission): 
    """
    Permissão customizada (Requisito da Sprint)
    Verifica se o usuário é Colaborador e possui um dos Perfis de 
    staff requeridos PARA TODOS OS MÉTODOS (GET, POST, PATCH, etc.)
    """
    message = "Você não tem permissão para gerenciar créditos. Acesso restrito ao Staff autorizado."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True
        
        try:
            perfis_do_usuario = request.user.colaborador.perfis.values_list('nome', flat=True)
            return bool(STAFF_ROLES_PERMITIDOS.intersection(perfis_do_usuario)) 
        except (Colaborador.DoesNotExist, AttributeError):
            return False