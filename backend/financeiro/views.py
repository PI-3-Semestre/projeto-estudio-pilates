# financeiro/views.py
from rest_framework import viewsets
from .models import Plano, Matricula, Pagamento, Produto, Venda
from .serializers import (
    PlanoSerializer,
    MatriculaSerializer,
    MatriculaReadSerializer,
    PagamentoSerializer,
    ProdutoSerializer,
    VendaSerializer,
    VendaReadSerializer
)
from .permissions import IsAdminFinanceiro, CanManagePagamentos
# Importa as ferramentas de documentação do Swagger
from drf_spectacular.utils import extend_schema, extend_schema_view

# ---
# ATUALIZAÇÃO: Documentação detalhada para o Swagger
# ---

@extend_schema(tags=['Financeiro - Planos'])
@extend_schema_view(
    list=extend_schema(summary="Lista todos os planos de serviço"),
    retrieve=extend_schema(summary="Busca um plano pelo ID"),
    create=extend_schema(summary="Cria um novo plano de serviço"),
    update=extend_schema(summary="Atualiza um plano de serviço"),
    partial_update=extend_schema(summary="Atualiza parcialmente um plano de serviço"),
    destroy=extend_schema(summary="Deleta um plano de serviço"),
)
class PlanoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Planos de serviço.
    Acesso restrito a Admin Master e Administradores.
    """
    # O 'tags' foi movido para os decoradores acima
    queryset = Plano.objects.all()
    serializer_class = PlanoSerializer
    permission_classes = [IsAdminFinanceiro]


@extend_schema(tags=['Financeiro - Matrículas'])
@extend_schema_view(
    list=extend_schema(summary="Lista todas as matrículas de alunos"),
    retrieve=extend_schema(summary="Busca uma matrícula pelo ID"),
    create=extend_schema(summary="Cria uma nova matrícula (associa aluno a plano)"),
    update=extend_schema(summary="Atualiza uma matrícula"),
    partial_update=extend_schema(summary="Atualiza parcialmente uma matrícula"),
    destroy=extend_schema(summary="Deleta uma matrícula"),
)
class MatriculaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Matrículas de alunos em planos.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Matricula.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return MatriculaReadSerializer
        return MatriculaSerializer


@extend_schema(tags=['Financeiro - Pagamentos'])
@extend_schema_view(
    list=extend_schema(summary="Lista todos os pagamentos (de matrículas ou vendas)"),
    retrieve=extend_schema(summary="Busca um pagamento pelo ID"),
    create=extend_schema(summary="Cria um novo registro de pagamento"),
    update=extend_schema(summary="Atualiza um pagamento (ex: marcar como pago)"),
    partial_update=extend_schema(summary="Atualiza parcialmente um pagamento"),
    destroy=extend_schema(summary="Deleta um registro de pagamento"),
)
class PagamentoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Pagamentos.
    - Admin Master/Administrador: Acesso total.
    - Recepcionista: Pode criar e visualizar.
    - Outros: Apenas visualizar.
    """
    queryset = Pagamento.objects.all()
    serializer_class = PagamentoSerializer
    permission_classes = [CanManagePagamentos]


@extend_schema(tags=['Financeiro - Produtos'])
@extend_schema_view(
    list=extend_schema(summary="Lista todos os produtos em estoque"),
    retrieve=extend_schema(summary="Busca um produto pelo ID"),
    create=extend_schema(summary="Cria um novo produto (para venda)"),
    update=extend_schema(summary="Atualiza um produto (ex: preço, estoque)"),
    partial_update=extend_schema(summary="Atualiza parcialmente um produto"),
    destroy=extend_schema(summary="Deleta um produto"),
)
class ProdutoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Produtos para venda.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAdminFinanceiro]


@extend_schema(tags=['Financeiro - Vendas'])
@extend_schema_view(
    list=extend_schema(summary="Lista todas as vendas de produtos"),
    retrieve=extend_schema(summary="Busca uma venda pelo ID"),
    create=extend_schema(summary="Cria uma nova venda (e baixa o estoque)"),
    update=extend_schema(summary="Atualiza os dados de uma venda"),
    partial_update=extend_schema(summary="Atualiza parcialmente os dados de uma venda"),
    destroy=extend_schema(summary="Deleta um registro de venda"),
)
class VendaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Vendas de produtos.
    - Admin Master/Administrador: Acesso total.
    - Recepcionista: Pode criar e visualizar.
    - Outros: Apenas visualizar.
    """
    queryset = Venda.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return VendaReadSerializer
        return VendaSerializer