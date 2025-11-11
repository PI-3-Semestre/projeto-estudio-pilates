# usuarios/views.py
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import Usuario, Colaborador, Perfil
from .serializers import UsuarioSerializer, ColaboradorSerializer, PerfilSerializer


@extend_schema(
    tags=['Colaboradores'],
    description="Retorna a lista de todos os perfis de colaborador disponíveis (ex: Instrutor, Fisioterapeuta) para serem usados em seletores no frontend."
)
class PerfisListView(APIView):
    """
    View para listar todos os perfis de usuário disponíveis no sistema.
    
    - Retorna uma lista de objetos, cada um contendo o `id` e o `nome` do perfil.
    - O acesso é permitido a qualquer usuário autenticado.
    - Utiliza cache para otimizar o desempenho, uma vez que os perfis mudam com pouca frequência.
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60 * 15)) # Cache de 15 minutos
    def get(self, request, *args, **kwargs):
        """
        Manipula requisições GET para retornar a lista de todos os perfis.
        """
        perfis = Perfil.objects.all().order_by('nome')
        serializer = PerfilSerializer(perfis, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from core.permissions import StudioPermissionMixin

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
class ColaboradorViewSet(StudioPermissionMixin, viewsets.ModelViewSet):
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
    permission_classes = [IsAdminMasterOrAdministrador]
    studio_filter_field = 'unidades'
