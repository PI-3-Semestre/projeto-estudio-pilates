# financeiro/serializers.py
from rest_framework import serializers
from django.db import transaction
# Import para corrigir os warnings do Swagger
from drf_spectacular.utils import extend_schema_field 
from .models import Plano, Matricula, Pagamento, Produto, Venda, Parcela, VendaProduto
from alunos.serializers import AlunoSerializer
from alunos.models import Aluno

# --- Serializers de Plano, Matrícula (sem alteração) ---

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
    aluno = AlunoSerializer(read_only=True)
    plano = PlanoSerializer(read_only=True)
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
            'aluno',
            'plano',
            'aluno_id',
            'plano_id',
            'data_inicio',
            'data_fim',
            'valor_pago',
            'status',
        ]

class PagamentoSerializer(serializers.ModelSerializer):
    # Usamos a string 'VendaSerializer' para evitar importação circular
    # Vamos corrigir o Warning com @extend_schema_field
    venda = serializers.SerializerMethodField() 
    matricula = MatriculaSerializer(read_only=True)
    matricula_id = serializers.PrimaryKeyRelatedField(
        queryset=Matricula.objects.all(), source='matricula', write_only=True, required=False
    )
    venda_id = serializers.PrimaryKeyRelatedField(
        queryset=Venda.objects.all(), source='venda', write_only=True, required=False
    )

    class Meta:
        model = Pagamento
        fields = [
            'id',
            'matricula',
            'venda',
            'matricula_id',
            'venda_id',
            'valor_total',
            'metodo_pagamento',
            'status',
            'data_vencimento',
            'data_pagamento',
        ]

    def validate(self, data):
        if not data.get('matricula') and not data.get('venda'):
            raise serializers.ValidationError("Um pagamento deve estar associado a uma matrícula ou a uma venda.")
        if data.get('matricula') and data.get('venda'):
            raise serializers.ValidationError("Um pagamento não pode estar associado a uma matrícula e a uma venda ao mesmo tempo.")
        return data

    # ---
    # AJUSTE PARA CORRIGIR O WARNING (Aviso)
    # ---
    # O @extend_schema_field diz ao Swagger qual é o tipo de retorno
    @extend_schema_field('VendaSerializer') 
    def get_venda(self, obj):
        # Esta função ajuda a evitar o erro de referência circular
        if obj.venda:
            # Temos que importar o VendaSerializer aqui dentro
            # para evitar o erro de definição circular
            from .serializers import VendaSerializer 
            return VendaSerializer(obj.venda).data
        return None

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'quantidade_estoque']

# --- INÍCIO DA ATUALIZAÇÃO DA TAREFA ---

class VendaProdutoInputSerializer(serializers.Serializer):
    """
    Serializer auxiliar usado APENAS para receber os dados de entrada
    dos itens da venda (o que o front-end vai enviar).
    """
    produto = serializers.PrimaryKeyRelatedField(queryset=Produto.objects.all())
    quantidade = serializers.IntegerField(min_value=1)

class VendaSerializer(serializers.ModelSerializer):
    """
    Serializer principal da Venda.
    """
    itens_venda = VendaProdutoInputSerializer(many=True, write_only=True)
    
    # ---
    # CORREÇÃO DO ERRO (AssertionError)
    # ---
    # O nome do campo é 'aluno' e o source (origem) é 'aluno'
    # no modelo, então o 'source=' é redundante e causava o crash.
    # Apenas removemos o "source='aluno',"
    aluno = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), 
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # Para leitura, podemos mostrar o AlunoSerializer
    aluno_detalhe = AlunoSerializer(source='aluno', read_only=True)

    class Meta:
        model = Venda
        fields = [
            'id',
            'aluno',             # Para escrita (ID do aluno)
            'aluno_detalhe',     # Para leitura (Objeto do aluno)
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
                        f"Pedido: {quantidade_total_pedida}, Disponível: {produto.quantidade_istoque}"
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

# --- FIM DA ATUALIZAÇÃO DA TAREFA ---

class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'