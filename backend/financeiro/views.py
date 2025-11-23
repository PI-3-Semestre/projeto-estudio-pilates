from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404

from .models import Plano, Matricula, Pagamento, Produto, Venda, EstoqueStudio
from studios.models import Studio
from usuarios.models import Usuario
from notifications.models import Notification
from .serializers import (
    PlanoSerializer,
    MatriculaSerializer,
    PagamentoSerializer,
    ProdutoSerializer,
    VendaSerializer,
    EstoqueAjusteSerializer,
    EstoqueStudioSerializer,
    ProdutoEstoqueSerializer
)
from .permissions import IsAdminFinanceiro, IsPaymentOwner, CanManagePagamentos

@extend_schema(tags=['Planos'])
class PlanoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Planos de serviço.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Plano.objects.all()
    serializer_class = PlanoSerializer
    permission_classes = [IsAdminFinanceiro]

@extend_schema(tags=['Matrículas'])
class MatriculaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Matrículas de alunos em planos.
    Acesso restrito a Admin Master e Administradores.
    """
    serializer_class = MatriculaSerializer
    permission_classes = [IsAdminFinanceiro]
    def get_queryset(self):
        """
        Otimiza a consulta para evitar problemas de N+1
        ao buscar o perfil do aluno, o plano e o studio.
        """
        return Matricula.objects.select_related(
            'aluno__aluno',
            'plano',
            'studio'
        ).all()

    def perform_create(self, serializer):
        serializer.save()

    @extend_schema(
        summary="Buscar Matrículas por Aluno",
        description="Retorna uma lista de matrículas associadas a um ID de aluno específico.",
        responses={200: MatriculaSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='aluno/(?P<aluno_id>[0-9]+)')
    def retrieve_by_aluno(self, request, aluno_id=None):
        """
        Busca matrículas pelo ID do aluno associado.
        """
        # Usamos filter() pois um aluno pode ter mais de uma matrícula (histórico)
        queryset = self.get_queryset().filter(aluno__id=aluno_id)
        
        # Se nenhuma matrícula for encontrada, retorna uma lista vazia (status 200 OK)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

@extend_schema(tags=['Financeiro - Pagamentos'])
@extend_schema_view(
    list=extend_schema(summary="Listar Pagamentos (Admin)"),
    create=extend_schema(summary="Criar Pagamento (Admin/Recep)"),
    retrieve=extend_schema(summary="Ver Detalhes do Pagamento (Admin)"),
    update=extend_schema(summary="Atualizar Pagamento (Admin)"),
    partial_update=extend_schema(summary="Atualizar Parcialmente (Admin)"),
    destroy=extend_schema(summary="Excluir Pagamento (Admin)"),
)
class PagamentoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Pagamentos.
    """
    queryset = Pagamento.objects.all()
    serializer_class = PagamentoSerializer
    permission_classes = [CanManagePagamentos]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        summary="Anexar Comprovante (Aluno)",
        description="Endpoint para o aluno (dono) fazer upload do seu comprovante.",
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'comprovante_pagamento': {
                        'type': 'string',
                        'format': 'binary'
                    }
                }
            }
        },
        responses={200: PagamentoSerializer}
    )
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, IsPaymentOwner],
        parser_classes=[MultiPartParser, FormParser]
    )
    def anexar_comprovante(self, request, pk=None):
        """
        Cenário 1: Endpoint para o ALUNO anexar seu comprovante e notificar admins.
        """
        pagamento = self.get_object()

        comprovante_file = request.data.get('comprovante_pagamento')
        if not comprovante_file:
            return Response(
                {"error": "Nenhum arquivo foi enviado com a chave 'comprovante_pagamento'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pagamento.comprovante_pagamento = comprovante_file
        pagamento.save()

        # --- Lógica de Notificação ---
        admin_roles = ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']
        admins = Usuario.objects.filter(role__in=admin_roles)
        aluno_nome = pagamento.matricula.aluno.get_full_name()
        plano_nome = pagamento.matricula.plano.nome
        
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                message=f"O aluno {aluno_nome} enviou um comprovante para o pagamento de {plano_nome}.",
                level=Notification.NotificationLevel.INFO,
                content_object=pagamento
            )
        # --- Fim da Lógica de Notificação ---

        serializer = self.get_serializer(pagamento)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Buscar Pagamento por ID da Venda",
        description="Retorna os detalhes de um pagamento associado a um ID de venda específico.",
        responses={
            200: PagamentoSerializer,
            404: {"description": "Pagamento não encontrado para o ID de venda fornecido."}
        }
    )
    @action(detail=False, methods=['get'], url_path='venda/(?P<venda_id>[0-9]+)')
    def retrieve_by_venda(self, request, venda_id=None):
        """
        Busca um pagamento pelo ID da venda associada.
        """
        pagamento = get_object_or_404(Pagamento, venda__id=venda_id)
        serializer = self.get_serializer(pagamento)
        return Response(serializer.data)

    @extend_schema(
        summary="Buscar Pagamentos por Matrícula",
        description="Retorna uma lista de pagamentos associados a um ID de matrícula específico.",
        responses={200: PagamentoSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='matricula/(?P<matricula_id>[0-9]+)')
    def retrieve_by_matricula(self, request, matricula_id=None):
        """
        Busca pagamentos pelo ID da matrícula associada.
        """
        # Usamos filter() pois uma matrícula pode ter vários pagamentos (mensalidades).
        queryset = self.get_queryset().filter(matricula__id=matricula_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

@extend_schema(tags=['Produtos'])
class ProdutoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Produtos para venda.
    """
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAdminFinanceiro]

@extend_schema(
    tags=['Produtos'],
    description='Endpoint para listar todos os produtos do catálogo, incluindo a quantidade em estoque para um estúdio específico.'
)
class ProdutosPorStudioView(APIView):
    """
    View para listar todos os produtos, com a quantidade de estoque
    anotada para um estúdio específico.
    """
    permission_classes = [IsAuthenticated] # Qualquer usuário logado pode ver os produtos e estoque

    def get(self, request, studio_id, format=None):
        # Garante que o estúdio existe
        get_object_or_404(Studio, pk=studio_id)

        # Pega todos os produtos do catálogo
        produtos = Produto.objects.all()

        # Passa o 'studio_id' para o contexto do serializer
        # para que ele possa buscar a quantidade correta
        serializer = ProdutoEstoqueSerializer(produtos, many=True, context={'studio_id': studio_id})
        
        return Response(serializer.data)

@extend_schema(tags=['Vendas'])
class VendaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Vendas de produtos.
    """
    queryset = Venda.objects.all()
    serializer_class = VendaSerializer
    permission_classes = [CanManagePagamentos]

    def perform_create(self, serializer):
        serializer.save()
        # A lógica de criação de VendaProduto e atualização de estoque
        # foi movida para o método create do VendaSerializer.

    @extend_schema(
        summary="Buscar Vendas por Aluno",
        description="Retorna uma lista de vendas associadas a um ID de aluno específico.",
        responses={200: VendaSerializer(many=True)}
    )
    @action(
        detail=False, 
        methods=['get'], 
        url_path='aluno/(?P<aluno_id>[0-9]+)',
        permission_classes=[CanManagePagamentos] # Manter a mesma permissão da ViewSet
    )
    def retrieve_by_aluno(self, request, aluno_id=None):
        """
        Busca vendas pelo ID do aluno associado.
        """
        # Usamos filter() pois um aluno pode ter várias vendas (histórico)
        queryset = self.get_queryset().filter(aluno__id=aluno_id)
        
        # Otimiza a consulta para buscar os produtos relacionados e evitar N+1 queries
        queryset = queryset.prefetch_related('produtos')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

@extend_schema(
    tags=['Estoque'],
    description='Endpoint para ajustar a quantidade de um produto em um estúdio.'
)
class EstoqueAjusteView(APIView):
    """
    View para realizar ajustes no estoque de um produto em um estúdio.
    Permite três operações: 'definir', 'adicionar' ou 'remover'.
    """
    permission_classes = [IsAdminFinanceiro]

    @extend_schema(
        request=EstoqueAjusteSerializer,
        responses={200: EstoqueStudioSerializer}
    )
    def post(self, request, *args, **kwargs):
        serializer = EstoqueAjusteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        produto_id = serializer.validated_data['produto_id']
        studio_id = serializer.validated_data['studio_id']
        quantidade = serializer.validated_data['quantidade']
        operacao = serializer.validated_data['operacao']

        estoque, created = EstoqueStudio.objects.get_or_create(
            produto_id=produto_id,
            studio_id=studio_id,
            defaults={'quantidade': 0}
        )

        if operacao == 'definir':
            estoque.quantidade = quantidade
        elif operacao == 'adicionar':
            estoque.quantidade += quantidade
        elif operacao == 'remover':
            if estoque.quantidade < quantidade:
                raise serializers.ValidationError(
                    f"Não é possível remover {quantidade} unidades. Estoque atual: {estoque.quantidade}."
                )
            estoque.quantidade -= quantidade
        
        estoque.save()

        response_serializer = EstoqueStudioSerializer(estoque)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

@extend_schema(tags=['Estoque'])
class EstoquePorStudioView(APIView):
    """
    View para listar o estoque de todos os produtos de um estúdio específico.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, studio_id, format=None):
        get_object_or_404(Studio, pk=studio_id)
        estoque = EstoqueStudio.objects.filter(studio_id=studio_id)
        serializer = EstoqueStudioSerializer(estoque, many=True)
        return Response(serializer.data)

@extend_schema(tags=['Estoque'])
class EstoquePorProdutoView(APIView):
    """
    View para listar o estoque de um produto específico em todos os estúdios.
    """
    permission_classes = [IsAdminFinanceiro]

    def get(self, request, produto_id, format=None):
        get_object_or_404(Produto, pk=produto_id)
        estoque = EstoqueStudio.objects.filter(produto_id=produto_id)
        serializer = EstoqueStudioSerializer(estoque, many=True)
        return Response(serializer.data)
