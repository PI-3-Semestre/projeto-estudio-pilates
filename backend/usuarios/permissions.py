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

class IsStaffAutorizado(BasePermission):
    """
    Permissão customizada (Requisito da Sprint)
    Permite acesso apenas a usuários com perfis de 'ADMIN_MASTER', 
    'ADMINISTRADOR' ou 'RECEPCIONISTA'.
    
    Esta permissão bloqueia TODOS os métodos (incluindo GET) 
    para quem não tiver um desses perfis.
    """
    message = "Você não tem permissão para esta ação. Acesso restrito ao Staff autorizado (Admin, Administrador ou Recepcionista)."

    def has_permission(self, request, view):
        # 1. O usuário deve estar logado
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Superusuário sempre tem permissão
        if request.user.is_superuser:
            return True
        
        # 3. O usuário deve ter um perfil de Colaborador e o perfil correto
        try:
            # Sua lógica de .filter().exists() está perfeita e eficiente.
            return request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
            ).exists()
            
        except Colaborador.DoesNotExist:
            # Se request.user.colaborador não existir, falha a permissão
            return False
        except AttributeError:
            # Se request.user não tiver 'colaborador' (ex: Aluno)
            return False