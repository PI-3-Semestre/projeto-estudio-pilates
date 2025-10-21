# studios/views.py
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Studio
from .serializers import StudioSerializer
from .permissions import IsAdminMasterOrReadOnly

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