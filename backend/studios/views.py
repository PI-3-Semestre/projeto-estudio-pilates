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

Fornece endpoints para:
- Listar studios (Administradores veem todos, outros colaboradores veem apenas os seus).
- Visualizar detalhes de um studio.
- Criar um novo studio (Requer permissão de `ADMIN_MASTER` ou `ADMINISTRADOR`).
- Atualizar um studio (Requer permissão de `ADMIN_MASTER` ou `ADMINISTRADOR`).
- Deletar um studio (Requer permissão de `ADMIN_MASTER` ou `ADMINISTRADOR`).
'''
)
class StudioViewSet(ModelViewSet):
    """
    ViewSet para gerenciar Studios (unidades).

    Fornece endpoints para:
    - Listar studios associados ao usuário
    - Criar um novo studio (requer permissão)
    - Visualizar detalhes de um studio
    - Atualizar um studio (requer permissão)
    - Deletar um studio (requer permissão)
    """
    serializer_class = StudioSerializer
    permission_classes = [IsAuthenticated]  # A permissão específica será verificada no controller

    def get_queryset(self):
        """
        Filtra o queryset para retornar apenas os studios aos quais o
        usuário logado tem acesso.
        """
        controller = StudioController()
        return controller.get_studios_for_user(self.request.user)

    def perform_create(self, serializer):
        """
        Utiliza o controller para criar um novo studio.
        A lógica de permissão está encapsulada no controller.
        """
        controller = StudioController()
        controller.create_studio(self.request.user, serializer.validated_data)

    def perform_update(self, serializer):
        """
        Utiliza o controller para atualizar um studio.
        A lógica de permissão está encapsulada no controller.
        """
        controller = StudioController()
        controller.update_studio(self.request.user, self.get_object(), serializer.validated_data)

    def perform_destroy(self, instance):
        """
        Utiliza o controller para deletar um studio.
        A lógica de permissão está encapsulada no controller.
        """
        controller = StudioController()
        controller.delete_studio(self.request.user, instance)