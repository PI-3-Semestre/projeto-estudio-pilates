# studios/views.py
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Studio
from .serializers import StudioSerializer

@extend_schema(
    tags=['Studios'],
    description='ViewSet para gerenciar os Studios (unidades).',
    # +++ ADICIONADO: Define explicitamente o parâmetro 'pk' (ID) na URL para a documentação.
    parameters=[
        OpenApiParameter(
            name='pk', 
            type=int, 
            location=OpenApiParameter.PATH,
            description='ID (Chave Primária) do Studio.'
        )
    ]
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
    # permission_classes = [IsAuthenticated] # Exemplo de permissão, ajuste se necessário