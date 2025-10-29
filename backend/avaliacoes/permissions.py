from rest_framework.permissions import BasePermission, SAFE_METHODS
from usuarios.models import Colaborador

class CanManageAvaliacaoObject(BasePermission):
    """
    Permissão customizada para o gerenciamento de Avaliações.
    - Aluno: Pode visualizar suas próprias avaliações (apenas leitura).
    - Admin Master/Administrador: Acesso total.
    - Fisioterapeuta: Acesso total apenas às avaliações que ele criou.
    - Recepcionista: Pode apenas criar novas avaliações (agendar).
    - Instrutor: Apenas leitura de lista (sem acesso ao detalhe).
    """
    message = "Você não tem permissão para realizar esta ação."

    def has_permission(self, request, view):
        """Define o acesso a nível de view (POST para criar, GET para listar)."""
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        # Se for um método seguro (GET), permite o acesso para verificar a permissão no nível do objeto.
        if request.method in SAFE_METHODS:
            return True

        # Para métodos não seguros (POST), verifica se é um colaborador com permissão para criar.
        try:
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
            return any(perfil in ['ADMIN_MASTER', 'INSTRUTOR', 'ADMINISTRADOR', 'RECEPCIONISTA', 'FISIOTERAPEUTA'] for perfil in user_perfis)
        except Colaborador.DoesNotExist:
            # Se não for um colaborador, não pode criar.
            return False

    def has_object_permission(self, request, view, obj):
        """Define o acesso a nível de objeto (GET, PUT, DELETE em uma avaliação específica)."""
        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser tem acesso total.
        if request.user.is_superuser:
            return True

        # O aluno pode visualizar sua própria avaliação.
        if request.method in SAFE_METHODS and obj.aluno.usuario == request.user:
            return True

        # Colaboradores têm permissões baseadas em seus perfis.
        try:
            user_perfis = set(request.user.colaborador.perfis.values_list('nome', flat=True))
        except Colaborador.DoesNotExist:
            # Se não for colaborador, e não for o dono (verificado acima), não tem permissão.
            return False

        # Admin Master e Administrador têm acesso total.
        if 'ADMIN_MASTER' in user_perfis or 'ADMINISTRADOR' in user_perfis:
            return True

        # Fisioterapeuta só pode acessar/modificar a avaliação que ele mesmo criou.
        if 'FISIOTERAPEUTA' in user_perfis:
            return obj.instrutor == request.user.colaborador

        # Recepcionista e Instrutor não podem ver/editar/deletar o conteúdo de uma avaliação.
        if 'RECEPCIONISTA' in user_perfis or 'INSTRUTOR' in user_perfis:
            # A permissão de lista (has_permission) já foi concedida, mas o acesso ao objeto é negado.
            return False

        return False
