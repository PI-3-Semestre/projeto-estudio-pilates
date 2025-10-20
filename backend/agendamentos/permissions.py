from rest_framework.permissions import BasePermission
from usuarios.models import Colaborador

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
