from rest_framework.permissions import BasePermission, SAFE_METHODS
from usuarios.models import Colaborador

class IsAdminFinanceiro(BasePermission):
    """
    Permissão que concede acesso total ao módulo financeiro para
    ADMIN_MASTER e ADMINISTRADOR.
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

class CanManagePagamentos(BasePermission):
    """
    Permissão customizada para o gerenciamento de pagamentos.
    - Admin Master/Administrador: Acesso total.
    - Recepcionista: Pode criar e visualizar pagamentos.
    - Outros: Sem acesso de escrita.
    """
    message = "Você não tem permissão para realizar esta ação em pagamentos."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            # Otimiza a busca pegando todos os nomes de uma vez.
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
        except Colaborador.DoesNotExist:
            return False

        # Admin Master e Administrador têm acesso total.
        if 'ADMIN_MASTER' in user_perfis or 'ADMINISTRADOR' in user_perfis:
            return True

        # Recepcionista pode criar (POST) e ler (GET, HEAD, OPTIONS).
        if 'RECEPCIONISTA' in user_perfis:
            return request.method in SAFE_METHODS or request.method == 'POST'

        # Outros perfis autenticados (Instrutor, Fisio) podem ter acesso de leitura.
        return request.method in SAFE_METHODS
