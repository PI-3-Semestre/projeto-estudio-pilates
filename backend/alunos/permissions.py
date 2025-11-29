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
        # 1. O usuário deve estar logado
        if not request.user or not request.user.is_authenticated:
            return False
        
        # 2. Superusuário sempre tem permissão
        if request.user.is_superuser:
            return True
            
        # 3. O usuário deve ter um perfil de Colaborador e um dos perfis necessários
        try:
            # Verifica se o colaborador tem algum dos perfis necessários.
            return request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
            ).exists()
        except Colaborador.DoesNotExist:
            # O usuário não tem um perfil de colaborador (ex: é um Aluno)
            return False

STAFF_ROLES_PERMITIDOS = {
    'ADMIN_MASTER', 
    'ADMINISTRADOR', 
    'RECEPCIONISTA'
}

class IsStaffAutorizado(permissions.BasePermission): # <--- Esta é a classe
    """
    Permissão customizada (Requisito da Sprint)
    Verifica se o usuário é Colaborador e possui um dos Perfis de 
    staff requeridos PARA TODOS OS MÉTODOS (GET, POST, PATCH, etc.)
    """
    message = "Você não tem permissão para gerenciar créditos. Acesso restrito ao Staff autorizado."

    def has_permission(self, request, view):
        # 1. O usuário deve estar logado
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Superusuário sempre tem permissão
        if request.user.is_superuser:
            return True
        
        # 3. O usuário deve ter um perfil de Colaborador
        try:
            # Checagem eficiente usando .exists() e o set que definimos
            perfis_do_usuario = request.user.colaborador.perfis.values_list('nome', flat=True)
            
            # Verifica se há qualquer intersecção
            return bool(STAFF_ROLES_PERMITIDOS.intersection(perfis_do_usuario))
            
        except (Colaborador.DoesNotExist, AttributeError):
            # Se request.user.colaborador não existir, ou
            # se request.user não tiver 'colaborador' (ex: Aluno)
            return False