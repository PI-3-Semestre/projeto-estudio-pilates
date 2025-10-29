# alunos/permissions.py
from rest_framework import permissions
from usuarios.models import Colaborador, Perfil

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

class IsOwnerOrAdminOrRecepcionista(permissions.BasePermission):
    """
    Permissão customizada para:
    - Permitir que donos de perfis de aluno vejam/editem seus próprios dados.
    - Permitir que Admins ou Recepcionistas acessem/editem qualquer dado.
    - Negar a listagem de todos os alunos para não-admins.
    """
    message = "Você não tem permissão para realizar esta ação."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Apenas admins/recepcionistas podem listar todos os alunos
        if view.action == 'list':
            if request.user.is_superuser:
                return True
            try:
                return request.user.colaborador.perfis.filter(
                    nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
                ).exists()
            except Colaborador.DoesNotExist:
                return False
        
        # Para outras ações (retrieve, create, update), a permissão é verificada no nível do objeto
        return True

    def has_object_permission(self, request, view, obj):
        # Admins/recepcionistas podem fazer tudo
        if request.user.is_superuser:
            return True
        try:
            if request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
            ).exists():
                return True
        except Colaborador.DoesNotExist:
            # Se não for colaborador, pode ser o próprio aluno
            pass

        # O dono do perfil pode ver/editar seus próprios dados
        return obj.usuario == request.user