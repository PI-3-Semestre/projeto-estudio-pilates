# financeiro/serializers.py
from rest_framework import serializers
from .models import Plano, Matricula, Pagamento, Produto, Venda, VendaProduto, Parcela, EstoqueStudio
from studios.models import Studio
from alunos.serializers import AlunoSerializer
from alunos.models import Aluno
from usuarios.models import Usuario 

# Serializer aninhado para Studio
class StudioNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['id', 'nome']

# Serializer aninhado para Aluno (usuário)
class AlunoNestedSerializer(serializers.ModelSerializer):
    nome_completo = serializers.CharField(source='get_full_name', read_only=True)
    class Meta:
        model = Usuario
        fields = ['id', 'nome_completo', 'cpf']

# Serializer aninhado para VendaProduto
class VendaProdutoNestedSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='produto.nome', read_only=True)
    class Meta:
        model = VendaProduto
        fields = ['produto_id', 'nome', 'quantidade', 'preco_unitario']

class PlanoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plano
        fields = [
            'id',
            'nome',
            'duracao_dias',
            'creditos_semanais',
            'preco',
        ]
class MatriculaSerializer(serializers.ModelSerializer):
    aluno = AlunoSerializer(source='aluno.aluno', read_only=True)
    
    plano = PlanoSerializer(read_only=True)
    
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(aluno__isnull=False),
        source='aluno',
        write_only=True
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
            'studio',
        ]
        
class VendaSerializer(serializers.ModelSerializer):
    studio = StudioNestedSerializer(read_only=True)
    studio_id = serializers.PrimaryKeyRelatedField(
        queryset=Studio.objects.all(), source='studio', write_only=True
    )
    aluno = AlunoNestedSerializer(read_only=True)
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(aluno__isnull=False), source='aluno', write_only=True, allow_null=True
    )
    produtos = VendaProdutoNestedSerializer(source='vendaproduto_set', many=True, read_only=True)
    valor_total = serializers.SerializerMethodField()

    class Meta:
        model = Venda
        fields = ['id', 'aluno', 'aluno_id', 'data_venda', 'produtos', 'studio', 'studio_id', 'valor_total']

    def get_valor_total(self, obj):
        return sum(item.preco_unitario * item.quantidade for item in obj.vendaproduto_set.all())

class PagamentoSerializer(serializers.ModelSerializer):
    matricula = MatriculaSerializer(read_only=True) 
    
    venda = VendaSerializer(read_only=True)
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
            'comprovante_pagamento', 
        ]
        # Definido read_only para upload seja feita pela action, sem ser feito nas rotas post/put
        read_only_fields = ['comprovante_pagamento']
        
    def validate(self, data):
        if not data.get('matricula') and not data.get('venda'):
            raise serializers.ValidationError("Um pagamento deve estar associado a uma matrícula ou a uma venda.")
        if data.get('matricula') and data.get('venda'):
            raise serializers.ValidationError("Um pagamento não pode estar associado a uma matrícula e a uma venda ao mesmo tempo.")
        return data

class EstoqueStudioSerializer(serializers.ModelSerializer):
    studio_nome = serializers.CharField(source='studio.nome', read_only=True)
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)

    class Meta:
        model = EstoqueStudio
        fields = ['id', 'produto', 'produto_nome', 'studio', 'studio_nome', 'quantidade']
        read_only_fields = ['produto_nome', 'studio_nome']

class EstoqueAjusteSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField()
    studio_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=0)
    operacao = serializers.ChoiceField(choices=['definir', 'adicionar', 'remover'])

    def validate_produto_id(self, value):
        if not Produto.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Produto não encontrado.")
        return value

    def validate_studio_id(self, value):
        if not Studio.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Studio não encontrado.")
        return value

class ProdutoSerializer(serializers.ModelSerializer):
    estoque_studios = EstoqueStudioSerializer(many=True, read_only=True, source='estoquestudio_set')

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'estoque_studios']
        
class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'
