# studios/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Studio
from .serializers import StudioSerializer
from .permissions import HasObjectPermission
from .controllers import StudioController

@extend_schema(tags=['Studios'])
class StudioListView(APIView):
    """
    Endpoint para listar os studios (unidades) aos quais o
    usuário logado está associado.
    """
    permission_classes = [IsAuthenticated]
    controller = StudioController()

    def get(self, request):
        studios = self.controller.get_studios_for_user(request.user)
        serializer = StudioSerializer(studios, many=True)
        return Response(serializer.data)

@extend_schema(tags=['Studios'])
class RelatorioFinanceiroView(APIView):
    """
    Endpoint de exemplo, protegido por permissão de objeto.
    Apenas usuários com a permissão 'manage_finances_studio' PARA ESTE
    studio específico poderão acessá-lo.
    """
    permission_classes = [IsAuthenticated, HasObjectPermission('studios.manage_finances_studio')]

    def get(self, request, studio_id):
        studio = get_object_or_404(Studio, pk=studio_id)

        # O DRF chama automaticamente o has_object_permission da nossa classe.
        # Esta linha garante que a verificação seja executada.
        self.check_object_permissions(request, studio)

        # Se o código chegou aqui, o usuário está autorizado.
        # Aqui entraria a lógica para gerar o relatório financeiro...
        dados_relatorio = {
            "studio_id": studio.id,
            "studio_nome": studio.nome,
            "mensagem": "Acesso ao relatório financeiro concedido.",
            "faturamento_mes": 15000.00,
            "despesas_mes": 8500.00
        }
        return Response(dados_relatorio, status=status.HTTP_200_OK)