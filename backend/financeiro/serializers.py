# financeiro/serializers.py
from rest_framework import serializers
from .models import Plano, Matricula, Pagamento, Produto, Venda, Parcela, VendaProduto
from alunos.models import Aluno
from usuarios.models import Usuario

class AlunoReadSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para leitura de Aluno, incluindo dados do Usuario.
    """
    nome_completo = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    
    class Meta:
        model = Aluno
        fields = ['id', 'nome_completo', 'email', 'dataNascimento', 'ativo']
        
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
    Serializer para intes de venda (VendaProduto), aninhando detalhes do produto
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
        
class VendaProdutoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendaProduto
        fields = ['produto', 'quantidade']
        
class VendaSerializer(serializers.ModelSerializer):
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), source='aluno', write_only=True
    )
    itens = VendaProdutoWriteSerializer(many=True)
    
    class Meta:
        model = Venda
        fields = ['id', 'aluno_id', 'data_venda', 'valor_total', 'metodo_pagamento', 'status', 'itens']
        
    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        venda = Venda.objects.create(**validated_data)
        for item_data in itens_data:
            VendaProduto.objects.create(venda=venda, **item_data)
        return venda
        
class VendaReadSerializer(serializers.ModelSerializer):
    aluno = AlunoReadSerializer(read_only=True)
    itens = VendaProdutoReadSerializer(many=True, read_only=True, source='vendaproduto_set')
    
    class Meta:
        model = Venda
        fields = ['id', 'aluno', 'data_venda', 'valor_total', 'metodo_pagamento', 'status', 'itens']
        

class PagamentoSerializer(serializers.ModelSerializer):
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
        ]
        
    def validate(self, data):
        if not data.get('matricula') and not data.get('venda'):
            raise serializers.ValidationError("Um pagamento deve estar associado a uma matrícula ou a uma venda.")
        if data.get('matricula') and data.get('venda'):
            raise serializers.ValidationError("Um pagamento não pode estar associado a uma matrícula e a uma venda ao mesmo tempo.")
        return data

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'quantidade_estoque']
        
class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'
