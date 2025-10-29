# studios/views.py
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from .models import Studio
from .serializers import StudioSerializer
from .permissions import IsAdminMasterOrReadOnly

@extend_schema_view(
    list=extend_schema(summary="Lista todos os studios"),
    create=extend_schema(summary="Cria um novo studio"),
    retrieve=extend_schema(summary="Busca um studio pelo ID"),
    update=extend_schema(summary="Atualiza os dados de um studio"),
    partial_update=extend_schema(summary="Atualiza parcialmente os dados de um studio"),
    destroy=extend_schema(summary="Deleta um studio"),
)
@extend_schema(
    tags=['Studios'],
    description='ViewSet para gerenciar os Studios (unidades).'
)
class StudioViewSet(viewsets.ModelViewSet):
    """
    ViewSet que fornece a API completa para o gerenciamento de Studios.
    
    - `GET /studios/`: Lista todos os studios.
    - `POST /studios/`: Cria um novo studio.
    - `GET /studios/{pk}/`: Retorna os detalhes de um studio específico.
    - `PUT /studios/{pk}/`: Atualiza completamente um studio.
    - `PATCH /studios/{pk}/`: Atualiza parcialmente um studio.
    - `DELETE /studios/{pk}/`: Remove um studio.
    """
    # ATENÇÃO: Confirme se os nomes do modelo e do serializer estão corretos.
    queryset = Studio.objects.all()
    serializer_class = StudioSerializer
    permission_classes = [IsAdminMasterOrReadOnly]