# agendamentos/permissions.py
from rest_framework.permissions import BasePermission
from usuarios.models import Colaborador

class HasRole(BasePermission):
    """
    Permissão customizada que verifica se o usuário possui um dos perfis 
    necessários para realizar a ação.

    Como usar:
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'RECEPCIONISTA'])]
    """
    message = "Você não tem permissão para realizar esta ação."

    def _init_(self, allowed_roles):
        super()._init_()
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        try:
            # Verifica se o colaborador do usuário tem algum dos perfis permitidos
            return request.user.colaborador.perfis.filter(
                nome__in=self.allowed_roles
            ).exists()
        except Colaborador.DoesNotExist:
            return False

    @classmethod
    def for_roles(cls, allowed_roles):
        """
        Método de fábrica para criar uma instância da permissão com os perfis desejados.
        Isso torna a declaração na view mais legível.
        """
        return cls(allowed_roles)

class IsOwnerDaAula(BasePermission):
    """
    Permissão que verifica se o usuário logado (instrutor) é o dono da aula.
    Esta é uma permissão a nível de objeto.
    """
    message = "Você só pode editar aulas das quais você é o instrutor."

    def has_object_permission(self, request, view, obj):
        # 'obj' aqui é a instância da Aula
        if not request.user or not hasattr(request.user, 'colaborador'):
            return False

        # Verifica se o colaborador do usuário é o instrutor principal ou substituto da aula
        return obj.instrutor_principal == request.user.colaborador or \
               obj.instrutor_substituto == request.user.colaborador

# --- Permissão antiga - pode ser removida ou mantida se usada em outros locais ---
class IsAdminAgendamento(BasePermission):
    """
    Permissão que concede acesso a recursos administrativos de agendamento
    apenas para ADMIN_MASTER e ADMINISTRADOR.
    """
    message = "Apenas Admin Master ou Administrador podem gerenciar este recurso."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
            
        try:
            return request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR']
            ).exists()
        except Colaborador.DoesNotExist:
            return False