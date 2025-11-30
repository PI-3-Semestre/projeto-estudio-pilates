from rest_framework.permissions import BasePermission
from usuarios.models import Colaborador

class IsOwnerDaAula(BasePermission):
    """
    Permissão que verifica se o usuário logado (instrutor) é o dono da aula.
    """
    message = "Você só pode editar aulas das quais você é o instrutor."

    def has_object_permission(self, request, view, obj):
        if not request.user or not hasattr(request.user, 'colaborador'):
            return False
            
        return obj.instrutor_principal == request.user.colaborador or \
               obj.instrutor_substituto == request.user.colaborador

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


class CanUpdateAula(BasePermission):
    """
    Permissão para atualizar (PUT/PATCH) uma aula.
    A permissão é concedida se o usuário for:
    Admin Master, Administrador OU Recepcionista
    OU
    O instrutor (principal ou substituto) da aula.
    """
    message = "Você não tem permissão para editar esta aula."

    def has_object_permission(self, request, view, obj):
 
        
   
        if request.user.is_superuser:
            return True

    
        if not hasattr(request.user, 'colaborador'):
            return False
            
        
        try:
            is_admin_or_recep = request.user.colaborador.perfis.filter(
                nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
            ).exists()
            
            if is_admin_or_recep:
                return True
        except Colaborador.DoesNotExist:
            pass

        is_owner = (obj.instrutor_principal == request.user.colaborador or
                    obj.instrutor_substituto == request.user.colaborador)
        
        return is_owner


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
        
        
        if not (request.user and request.user.is_authenticated and hasattr(request.user, 'aluno')):
            return False
        
        
        return obj.aluno == request.user.aluno