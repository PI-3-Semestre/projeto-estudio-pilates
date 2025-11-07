from rest_framework import viewsets, status
from rest_framework.decorators import action 
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser 
from rest_framework.response import Response 
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Plano, Matricula, Pagamento, Produto, Venda
from .serializers import (
    PlanoSerializer,
    MatriculaSerializer,
    PagamentoSerializer,
    ProdutoSerializer,
    VendaSerializer
)
from .permissions import IsAdminFinanceiro, IsPaymentOwner, CanManagePagamentos

@extend_schema(tags=['Financeiro - Planos e Matrículas'])
class PlanoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Planos de serviço.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Plano.objects.all()
    serializer_class = PlanoSerializer
    permission_classes = [IsAdminFinanceiro]

@extend_schema(tags=['Financeiro - Planos e Matrículas'])
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
        ao buscar o perfil do aluno e o plano.
        """
        # Esta é a otimização:
        return Matricula.objects.select_related(
            'aluno__aluno', # Busca o Usuário (aluno) E o perfil Aluno (aluno__aluno)
            'plano'         # Busca o Plano relacionado
        ).all()
    
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
    - Admin Master/Administrador: Acesso total.
    - Recepcionista: Pode criar e visualizar.
    - Outros: Apenas visualizar.
    """
    queryset = Pagamento.objects.all()
    serializer_class = PagamentoSerializer
    permission_classes = [CanManagePagamentos]
    
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
   
    #Action customizada para upload de comprovante (Tarefa)
    @action(
        detail=True,
        methods=['post'],
        # Esta action usa permissões ESPECÍFICAS,
        # ignorando a 'permission_classes' principal do ViewSet.
        permission_classes=[IsAuthenticated, IsPaymentOwner],
        parser_classes=[MultiPartParser, FormParser] 
    )
    def anexar_comprovante(self, request, pk=None):
        """
        Endpoint para o ALUNO anexar seu comprovante.
        """
        # self.get_object() usa o 'pk' da URL para buscar o Pagamento
        # e executa a permissão IsPaymentOwner
        pagamento = self.get_object() 

        comprovante_file = request.data.get('comprovante_pagamento')
        if not comprovante_file:
            return Response(
                {"error": "Nenhum arquivo foi enviado com a chave 'comprovante_pagamento'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pagamento.comprovante_pagamento = comprovante_file
        # Opcional: Mudar status para notificar admin
        # pagamento.status = 'PENDENTE' 
        pagamento.save()

        # Retorna o objeto Pagamento atualizado, agora com a URL do comprovante
        serializer = self.get_serializer(pagamento)
        return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema(tags=['Financeiro - Vendas e Produtos'])
class ProdutoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar Produtos para venda.
    Acesso restrito a Admin Master e Administradores.
    """
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAdminFinanceiro]

@extend_schema(tags=['Financeiro - Vendas e Produtos'])
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