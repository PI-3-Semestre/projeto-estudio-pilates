from rest_framework.permissions import BasePermission, SAFE_METHODS
from usuarios.models import Colaborador
from django.db.models import Q

class IsAlunoOwner(BasePermission):
    """
    Permissão customizada que verifica se o usuário logado possui um perfil de Aluno.
    """
    message = "Apenas usuários com perfil de aluno podem acessar esta funcionalidade."

    def has_permission(self, request, view):
        print(f"DEBUG: IsAlunoOwner.has_permission para {request.user.username}")
        result = request.user and request.user.is_authenticated and hasattr(request.user, 'aluno')
        print(f"DEBUG: IsAlunoOwner.has_permission retornou {result}")
        return result

class IsAlunoOwnerOfMatricula(BasePermission):
    """
    Permissão customizada que verifica se o usuário logado é o Aluno
    associado à matrícula.
    """
    message = "Você não tem permissão para acessar esta matrícula."

    def has_object_permission(self, request, view, obj):
        print(f"DEBUG: IsAlunoOwnerOfMatricula.has_object_permission para {request.user.username} e matricula {obj.id}")
        result = request.user and request.user.is_authenticated and \
               hasattr(request.user, 'aluno') and \
               obj.aluno == request.user.aluno
        print(f"DEBUG: IsAlunoOwnerOfMatricula.has_object_permission retornou {result}")
        return result

class IsAdminFinanceiro(BasePermission):
    """
    Permissão que concede acesso total ao módulo financeiro para
    ADMIN_MASTER e ADMINISTRADOR.
    """
    message = "Apenas Admin Master ou Administrador podem gerenciar este recurso."

    def has_permission(self, request, view):
        print(f"DEBUG: IsAdminFinanceiro.has_permission para {request.user.username}")
        if not request.user or not request.user.is_authenticated:
            print("DEBUG: IsAdminFinanceiro.has_permission - Não autenticado")
            return False
        
        if request.user.is_superuser:
            print("DEBUG: IsAdminFinanceiro.has_permission - Superuser")
            return True
            
        try:
            result = request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR']
            ).exists()
            print(f"DEBUG: IsAdminFinanceiro.has_permission - Colaborador com perfil: {result}")
            return result
        except Colaborador.DoesNotExist:
            print("DEBUG: IsAdminFinanceiro.has_permission - Colaborador.DoesNotExist")
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
        print(f"DEBUG: CanManagePagamentos.has_permission para {request.user.username}")
        if not request.user or not request.user.is_authenticated:
            print("DEBUG: CanManagePagamentos.has_permission - Não autenticado")
            return False

        try:
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
            print(f"DEBUG: CanManagePagamentos.has_permission - Perfis do usuário: {user_perfis}")
        except Colaborador.DoesNotExist:
            print("DEBUG: CanManagePagamentos.has_permission - Colaborador.DoesNotExist")
            return False

        # Admin Master e Administrador têm acesso total.
        if 'ADMIN_MASTER' in user_perfis or 'ADMINISTRADOR' in user_perfis:
            print("DEBUG: CanManagePagamentos.has_permission - ADMIN_MASTER/ADMINISTRADOR")
            return True

        # Recepcionista pode criar (POST) e ler (GET, HEAD, OPTIONS).
        if 'RECEPCIONISTA' in user_perfis:
            result = request.method in SAFE_METHODS or request.method == 'POST'
            print(f"DEBUG: CanManagePagamentos.has_permission - RECEPCIONISTA: {result}")
            return result

        # Outros perfis autenticados (Instrutor, Fisio) podem ter acesso de leitura.
        result = request.method in SAFE_METHODS
        print(f"DEBUG: CanManagePagamentos.has_permission - Outros perfis: {result}")
        return result

class IsPaymentOwner(BasePermission):
    """
    Permite acesso apenas se o request.user for o aluno associado ao pagamento.
    """

    message = "Você não tem permissão para acessar este pagamento."

    def has_object_permission(self, request, view, obj):
        print(f"DEBUG: IsPaymentOwner.has_object_permission para {request.user.username} e pagamento {obj.id}")
        # 'obj' é a instância do Pagamento (que é o 'obj' que estamos verificando)
        
        # Verificamos se o pagamento está ligado a uma matrícula
        if obj.matricula:
            result = obj.matricula.aluno == request.user # Comparar com o Usuario logado
            print(f"DEBUG: IsPaymentOwner.has_object_permission - Via Matrícula: {result}")
            return result
    
        # Verificamos se o pagamento está ligado a uma venda
        if obj.venda:
            result = obj.venda.aluno == request.user # Comparar com o Usuario logado
            print(f"DEBUG: IsPaymentOwner.has_object_permission - Via Venda: {result}")
            return result
        print("DEBUG: IsPaymentOwner.has_object_permission - Sem matrícula ou venda")
        return False