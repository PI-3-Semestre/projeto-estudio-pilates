from rest_framework.permissions import BasePermission
from usuarios.models import Colaborador

class IsStaffAgendamento(BasePermission):
    """
    Permissão que concede acesso a recursos administrativos de agendamento
    apenas para staff (ADMIN_MASTER, ADMINISTRADOR, RECEPCIONISTA)
    """
    message = "Apenas Admin Master, Administrador ou recepcionista, podem gerenciar este recurso."

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

class IsOwnerDoAgendamento(BasePermission):
    """
    Permissão customizada que verifica se o usuário logado é o Aluno
    associado a este agendamento (obj.aluno).
    """
    message = "Você só pode realizar esta ação em seus próprios agendamentos."

    def has_object_permission(self, request, view, obj):
        """
        Verifica a permissão em nível de objeto (para GET, PUT, PATCH, DELETE).
        'obj' aqui deve ser uma instância de AulaAluno.
        """
        
        # (O modelo Aluno tem a FK para Usuario)
        if not (request.user and request.user.is_authenticated and hasattr(request.user, 'aluno')):
            return False
        
        # Compara o aluno do objeto (obj.aluno) com o aluno logado (request.user.aluno)
        return obj.aluno == request.user.aluno