from rest_framework import viewsets
from .models import Plano, Matricula, Pagamento, Produto, Venda
from .serializers import (
    PlanoSerializer,
    MatriculaSerializer,
    PagamentoSerializer,
    ProdutoSerializer,
    VendaSerializer
)
from .permissions import IsAdminFinanceiro, CanManagePagamentos

class PlanoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Planos de serviço.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Plano.objects.all()
    serializer_class = PlanoSerializer
    permission_classes = [IsAdminFinanceiro]

class MatriculaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Matrículas de alunos em planos.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Matricula.objects.all()
    serializer_class = MatriculaSerializer
    permission_classes = [IsAdminFinanceiro]

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

class ProdutoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Produtos para venda.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAdminFinanceiro]

class VendaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Vendas de produtos.
    - Admin Master/Administrador: Acesso total.
    - Recepcionista: Pode criar e visualizar.
    - Outros: Apenas visualizar.
    """
    queryset = Venda.objects.all()
    serializer_class = VendaSerializer
    permission_classes = [CanManagePagamentos]