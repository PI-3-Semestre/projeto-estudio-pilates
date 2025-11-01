# avaliacoes/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from usuarios.models import Colaborador

class CanManageAvaliacaoObject(BasePermission):
    """
    Permissão customizada para o gerenciamento de Avaliações.
    - Admin Master/Administrador: Acesso total.
    - Fisioterapeuta: Acesso total apenas às avaliações que ele criou.
    - Recepcionista: Pode apenas criar novas avaliações (agendar).
    - Instrutor: Apenas leitura de lista (sem acesso ao detalhe).
    """
    message = "Você não tem permissão para realizar esta ação."

    def has_permission(self, request, view):
        """Define o acesso a nível de view (POST para criar, GET para listar)."""
        if request.user and request.user.is_superuser:
            return True
            
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
        except Colaborador.DoesNotExist:
            return False

        # Permite a criação (POST) para perfis administrativos e fisios.
        if request.method == 'POST':
            return any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA', 'FISIOTERAPEUTA'] for perfil in user_perfis)

        # Permite o acesso à lista (GET) para qualquer colaborador autenticado.
        # A sensibilidade está no acesso ao objeto individual.
        return True

    def has_object_permission(self, request, view, obj):
        """Define o acesso a nível de objeto (GET, PUT, DELETE em uma avaliação específica)."""
        if request.user and request.user.is_superuser:
            return True
            
        try:
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
        except Colaborador.DoesNotExist:
            return False

        # Admin Master e Administrador têm acesso total a qualquer objeto.
        if 'ADMIN_MASTER' in user_perfis or 'ADMINISTRADOR' in user_perfis:
            return True

        # Fisioterapeuta só pode acessar/modificar a avaliação que ele mesmo criou.
        if 'FISIOTERAPEUTA' in user_perfis:
            return obj.instrutor == request.user.colaborador

        # Recepcionista e Instrutor não podem ver/editar/deletar o conteúdo de uma avaliação.
        if 'RECEPCIONISTA' in user_perfis or 'INSTRUTOR' in user_perfis:
            return False

        return False
