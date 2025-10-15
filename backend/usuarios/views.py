# usuarios/views.py
from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema
from .models import Usuario, Colaborador
from .serializers import UsuarioSerializer, ColaboradorSerializer

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

**Nota:** Todas as operações neste endpoint requerem permissão de Administrador (`is_staff=True`).
'''
)
class UsuarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Usuario.objects.all().order_by('-date_joined')
    serializer_class = UsuarioSerializer
    # Apenas administradores podem gerenciar usuários
    permission_classes = [permissions.IsAdminUser]

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

**Nota:** Todas as operações neste endpoint requerem permissão de Administrador (`is_staff=True`).
'''
)
class ColaboradorViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows collaborators to be viewed or edited.
    """
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    lookup_field = 'usuario__cpf'  # Usa o CPF do usuário relacionado para buscar
    # Apenas administradores podem gerenciar colaboradores
    permission_classes = [permissions.IsAdminUser]