# financeiro/serializers.py
from rest_framework import serializers
from django.db import transaction
# Import para corrigir os warnings do Swagger
from drf_spectacular.utils import extend_schema_field 
from .models import Plano, Matricula, Pagamento, Produto, Venda, Parcela, VendaProduto
from alunos.serializers import AlunoSerializer # Usado na VendaSerializer
from alunos.models import Aluno
from usuarios.models import Usuario

class AlunoReadSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para leitura de Aluno, incluindo dados do Usuario.
    """
    nome_completo = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    
    # ---
    # CORREÇÃO (Aviso): 
    # Diz explicitamente ao Swagger qual é o tipo do 'cpf'
    # ---
    cpf = serializers.CharField(read_only=True)

    class Meta:
        model = Aluno
        fields = ['cpf', 'nome_completo', 'email', 'dataNascimento']
        
class PlanoReadSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para leitura de planos
    """
    class Meta:
        model = Plano
        fields = ['id','nome', 'preco', 'creditos_semanais', 'duracao_dias']

class ProdutoReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco']
    
class VendaProdutoReadSerializer(serializers.ModelSerializer):
    """
    Serializer para itens de venda (VendaProduto), aninhando detalhes do produto
    """
    produto = ProdutoReadSerializer(read_only=True)
    
    class Meta:
        model = VendaProduto
        fields = ['id', 'produto', 'quantidade', 'preco_unitario']
        
class PlanoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plano
        fields = [
            'id',
            'nome',
            'duracao_dias',
            'creditos_semanais',
            'preco',
            'data_criacao',
            'data_ultima_modificacao'
        ]
        
class MatriculaSerializer(serializers.ModelSerializer):
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), source='aluno', write_only=True
    )
    plano_id = serializers.PrimaryKeyRelatedField(
        queryset=Plano.objects.all(), source='plano', write_only=True
    )

    class Meta:
        model = Matricula
        fields = [
            'id',
            'aluno_id',
            'plano_id',
            'data_inicio',
            'data_fim',
            'valor_pago',
            'status',
        ]

class MatriculaReadSerializer(serializers.ModelSerializer):
    aluno = AlunoReadSerializer(read_only=True)
    plano = PlanoReadSerializer(read_only=True)
    
    class Meta:
        model = Matricula
        fields = [
            'id',
            'aluno',
            'plano',
            'data_inicio',
            'data_fim',
            'valor_pago',
            'status',
        ]

# ---
# Versão correta dos Serializers de Venda
# ---

class VendaProdutoInputSerializer(serializers.Serializer):
    """
    Serializer auxiliar usado APENAS para receber os dados de entrada
    dos itens da venda (o que o front-end vai enviar).
    """
    produto = serializers.PrimaryKeyRelatedField(queryset=Produto.objects.all())
    quantidade = serializers.IntegerField(min_value=1)

class VendaSerializer(serializers.ModelSerializer):
    """
    Serializer principal da Venda (para Escrita/Write).
    """
    itens_venda = VendaProdutoInputSerializer(many=True, write_only=True)
    
    aluno = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), 
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Venda
        fields = [
            'id',
            'aluno',             # Para escrita (ID do aluno)
            'data_venda',
            'itens_venda'        # Apenas para escrita (write_only)
        ]
        read_only_fields = ['id', 'data_venda']

    def validate(self, data):
        """
        Valida o estoque ANTES de tentar criar a venda.
        """
        itens_data = data.get('itens_venda', [])

        if not itens_data:
            raise serializers.ValidationError("A venda deve conter pelo menos um produto.")

        estoque_necessario = {}

        for item in itens_data:
            produto = item['produto']
            quantidade_pedida = item['quantidade']
            
            total_no_carrinho = estoque_necessario.get(produto.pk, 0)
            estoque_necessario[produto.pk] = total_no_carrinho + quantidade_pedida

        for produto_pk, quantidade_total_pedida in estoque_necessario.items():
            try:
                produto = Produto.objects.select_for_update().get(pk=produto_pk)
                
                if quantidade_total_pedida > produto.quantidade_estoque:
                    raise serializers.ValidationError(
                        f"Estoque insuficiente para o produto '{produto.nome}'. "
                        f"Pedido: {quantidade_total_pedida}, Disponível: {produto.quantidade_estoque}"
                    )
            except Produto.DoesNotExist:
                raise serializers.ValidationError(f"Produto com ID {produto_pk} não encontrado.")

        return data

    def create(self, validated_data):
        """
        Sobrescreve o 'create' para salvar a Venda e os VendaProduto
        de forma atômica (tudo ou nada).
        """
        itens_data = validated_data.pop('itens_venda')

        with transaction.atomic():
            venda = Venda.objects.create(**validated_data)

            for item_data in itens_data:
                produto = item_data['produto']
                VendaProduto.objects.create(
                    venda=venda,
                    produto=produto,
                    quantidade=item_data['quantidade'],
                    preco_unitario=produto.preco 
                )
                
        return venda

class VendaReadSerializer(serializers.ModelSerializer):
    """
    Serializer principal da Venda (para Leitura/Read).
    """
    aluno = AlunoReadSerializer(read_only=True)
    itens = VendaProdutoReadSerializer(many=True, read_only=True, source='vendaproduto_set')
    
    class Meta:
        model = Venda
        # ---
        # CORREÇÃO (Erro 500): 
        # Removidos 'valor_total', 'metodo_pagamento', e 'status'
        # porque eles NÃO existem no modelo Venda.
        # ---
        fields = ['id', 'aluno', 'data_venda', 'itens']
        

class PagamentoSerializer(serializers.ModelSerializer):
    venda = serializers.SerializerMethodField() 
    matricula = MatriculaSerializer(read_only=True)
    matricula_id = serializers.PrimaryKeyRelatedField(
        queryset=Matricula.objects.all(), source='matricula', write_only=True, required=False, allow_null=True
    )
    venda_id = serializers.PrimaryKeyRelatedField(
        queryset=Venda.objects.all(), source='venda', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Pagamento
        fields = [
            'id',
            'matricula_id',
            'venda_id',
            'valor_total',
            'metodo_pagamento',
            'status',
            'data_vencimento',
            'data_pagamento',
            'matricula',
            'venda',
        ]
        
    def validate(self, data):
        if not data.get('matricula') and not data.get('venda'):
            raise serializers.ValidationError("Um pagamento deve estar associado a uma matrícula ou a uma venda.")
        if data.get('matricula') and data.get('venda'):
            raise serializers.ValidationError("Um pagamento não pode estar associado a uma matrícula e a uma venda ao mesmo tempo.")
        return data

    @extend_schema_field(VendaReadSerializer) 
    def get_venda(self, obj):
        if obj.venda:
            return VendaReadSerializer(obj.venda).data
        return None

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'quantidade_estoque']

class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'