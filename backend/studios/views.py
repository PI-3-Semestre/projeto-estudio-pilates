# studios/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.shortcuts import get_object_or_404
from .models import Studio
from .serializers import StudioSerializer, DashboardSerializer
from .permissions import IsAdminMasterOrReadOnly, IsStudioAdminOrAdminMaster
# Import models from other apps for aggregation
from financeiro.models import Matricula, Venda, EstoqueStudio, Pagamento
from avaliacoes.models import Avaliacao
from agendamentos.models import AulaAluno
from django.utils import timezone

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


@extend_schema(
    tags=['Dashboard'],
    description='Endpoint para o dashboard de gerenciamento de um Studio específico.'
)
class DashboardStudioView(APIView):
    permission_classes = [IsStudioAdminOrAdminMaster]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='studio_pk', type=int, location=OpenApiParameter.PATH, description='ID do Studio'),
        ],
        responses={200: DashboardSerializer},
    )
    def get(self, request, studio_pk, format=None):
        studio = get_object_or_404(Studio, pk=studio_pk)
        self.check_object_permissions(request, studio)

        # Financeiro Data
        total_matriculas = Matricula.objects.filter(studio=studio).count()
        total_vendas = Venda.objects.filter(studio=studio).count()
        total_pagamentos_pendentes = Pagamento.objects.filter(matricula__studio=studio, status='PENDENTE').count()
        total_pagamentos_atrasados = Pagamento.objects.filter(matricula__studio=studio, status='ATRASADO').count()

        financeiro_data = {
            "total_matriculas": total_matriculas,
            "total_vendas": total_vendas,
            "total_pagamentos_pendentes": total_pagamentos_pendentes,
            "total_pagamentos_atrasados": total_pagamentos_atrasados,
        }

        # Avaliacoes Data
        total_avaliacoes = Avaliacao.objects.filter(studio=studio).count()
        avaliacoes_data = {
            "total_avaliacoes": total_avaliacoes,
        }

        # Agendamentos Data
        today = timezone.localdate()
        # Count AulaAluno instances where the associated Aula is for today and the studio matches
        total_agendamentos_hoje = AulaAluno.objects.filter(
            aula__studio=studio,
            aula__data_hora_inicio__date=today
        ).count()
        # Count AulaAluno instances where the status is 'AGENDADO' (assuming this means pending)
        total_agendamentos_pendentes = AulaAluno.objects.filter(
            aula__studio=studio,
            status_presenca=AulaAluno.StatusPresenca.AGENDADO
        ).count()

        agendamentos_data = {
            "total_agendamentos_hoje": total_agendamentos_hoje,
            "total_agendamentos_pendentes": total_agendamentos_pendentes,
        }

        dashboard_data = {
            "studio_id": studio.id,
            "studio_name": studio.nome,
            "financeiro": financeiro_data,
            "avaliacoes": avaliacoes_data,
            "agendamentos": agendamentos_data,
        }

        serializer = DashboardSerializer(dashboard_data)
        return Response(serializer.data, status=status.HTTP_200_OK)