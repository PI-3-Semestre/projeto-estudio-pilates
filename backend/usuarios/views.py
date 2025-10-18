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
    ViewSet para gerenciar as contas de usuário (modelo Usuario).
    
    Fornece todas as operações CRUD (List, Create, Retrieve, Update, Destroy)
    para o modelo de usuário base do Django.
    """
    # O queryset define a coleção de objetos que esta view irá operar.
    queryset = Usuario.objects.all().order_by('-date_joined')
    
    # O serializer que será usado para converter os dados.
    serializer_class = UsuarioSerializer
    
    # A permissão define quem pode acessar esta view.
    # Apenas Admin Master ou Administradores podem gerenciar usuários.
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
    ViewSet para gerenciar os perfis de colaborador (modelo Colaborador).
    
    Fornece todas as operações CRUD para os perfis, que contêm informações 
    profissionais e de permissão dos usuários.
    """
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    
    # Define o campo usado para buscar um colaborador individual. 
    # Em vez de usar o ID do colaborador, usa o CPF do usuário relacionado.
    # Ex: /api/colaboradores/12345678901/
    lookup_field = 'usuario__cpf'
    
    # Apenas o Admin Master pode gerenciar perfis de colaborador.
    # Esta é uma permissão mais restrita para uma ação mais sensível.
    permission_classes = [IsAdminMaster]
