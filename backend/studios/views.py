# studios/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from .models import Studio
from .serializers import StudioSerializer
from .controllers import StudioController

@extend_schema(
    tags=['Studios'],
    description='''
ViewSet para gerenciar Studios (unidades).

- **Listar (GET):** Administradores veem todos os studios. Outros colaboradores veem apenas os studios a que estão associados.
- **Criar (POST):** Requer permissão de `ADMIN_MASTER` ou `ADMINISTRADOR`.
- **Atualizar (PUT/PATCH):** Requer permissão de `ADMIN_MASTER` ou `ADMINISTRADOR`.
- **Deletar (DELETE):** Requer permissão de `ADMIN_MASTER` ou `ADMINISTRADOR`.
'''
)
class StudioViewSet(ModelViewSet):
    """
    ViewSet para a entidade Studio (unidade).
    
    Esta classe delega toda a lógica de negócio e de permissões para o `StudioController`,
    mantendo a View limpa e focada em lidar com as requisições e respostas da API.
    """
    serializer_class = StudioSerializer
    
    # A verificação de permissão inicial é apenas se o usuário está autenticado.
    # A lógica de permissão granular (quem pode fazer o quê) é tratada no StudioController.
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Delega a busca da lista de studios para o controller.
        O controller retorna a lista correta de studios com base no usuário logado.
        """
        controller = StudioController()
        return controller.get_studios_for_user(self.request.user)

    def perform_create(self, serializer):
        """
        Delega a criação de um novo studio para o controller.
        O controller verificará a permissão do usuário antes de criar.
        """
        controller = StudioController()
        # O serializer.save() não é chamado aqui; o controller cuida da criação.
        controller.create_studio(self.request.user, serializer.validated_data)

    def perform_update(self, serializer):
        """
        Delega a atualização de um studio para o controller.
        O controller verificará a permissão do usuário antes de atualizar.
        """
        controller = StudioController()
        # O serializer.save() não é chamado aqui; o controller cuida da atualização.
        controller.update_studio(self.request.user, self.get_object(), serializer.validated_data)

    def perform_destroy(self, instance):
        """
        Delega a exclusão de um studio para o controller.
        O controller verificará a permissão do usuário antes de deletar.
        """
        controller = StudioController()
        controller.delete_studio(self.request.user, instance)
