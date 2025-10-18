# usuarios/views.py
from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema
from .models import Usuario, Colaborador
from .serializers import UsuarioSerializer, ColaboradorSerializer

from .permissions import IsAdminMaster, IsAdminMasterOrAdministrador

@extend_schema(
    tags=['Contas de Usuário'],
    description='''
ViewSet para gerenciar as Contas de Usuário.

Fornece endpoints para:
- Listar todos os usuários.
- Visualizar detalhes de um usuário.
- Criar um novo usuário.
- Atualizar um usuário existente.
- Deletar um usuário.

**Nota:** Apenas usuários com perfil de 'Admin Master' ou 'Administrador' podem realizar esta ação.
'''
)
class UsuarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Usuario.objects.all().order_by('-date_joined')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminMasterOrAdministrador]

@extend_schema(
    tags=['Colaboradores'],
    description='''
ViewSet para gerenciar os perfis de Colaborador.

Fornece endpoints para:
- Listar todos os colaboradores.
- Visualizar detalhes de um colaborador (busca por CPF do usuário).
- Criar um novo perfil de colaborador.
- Atualizar um perfil de colaborador.
- Deletar um perfil de colaborador.

**Nota:** Apenas usuários com perfil de 'Admin Master' podem realizar esta ação.
'''
)
class ColaboradorViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows collaborators to be viewed or edited.
    """
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    lookup_field = 'usuario__cpf'
    permission_classes = [IsAdminMaster]
