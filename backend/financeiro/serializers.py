# financeiro/serializers.py
from rest_framework import serializers
from django.db import transaction # Importar transaction para garantir atomicidade
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

# Serializer para leitura de VendaProduto (como já existia)
class VendaProdutoNestedSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='produto.nome', read_only=True)
    class Meta:
        model = VendaProduto
        fields = ['produto_id', 'nome', 'quantidade', 'preco_unitario']

# NOVO Serializer para escrita de VendaProduto (receber dados do frontend)
class VendaProdutoWriteSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1)
    preco_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)

    def validate_produto_id(self, value):
        if not Produto.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Produto não encontrado.")
        return value

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
    # Campo para receber os produtos na criação/atualização
    produtos_vendidos = VendaProdutoWriteSerializer(many=True, write_only=True)
    # Campo para exibir os produtos na leitura
    produtos = VendaProdutoNestedSerializer(source='vendaproduto_set', many=True, read_only=True)
    
    valor_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True) # Será calculado no create

    class Meta:
        model = Venda
        fields = ['id', 'aluno', 'aluno_id', 'data_venda', 'produtos', 'produtos_vendidos', 'studio', 'studio_id', 'valor_total']
        read_only_fields = ['data_venda'] # data_venda é preenchida automaticamente pelo modelo

    @transaction.atomic # Garante que todas as operações sejam bem-sucedidas ou revertidas
    def create(self, validated_data):
        produtos_data = validated_data.pop('produtos_vendidos', [])
        
        if not produtos_data:
            raise serializers.ValidationError("É necessário informar pelo menos um produto para a venda.")

        # Pré-validação de estoque antes de criar a venda
        studio_id = validated_data.get('studio').id if validated_data.get('studio') else None
        if not studio_id:
            raise serializers.ValidationError("O estúdio da venda é obrigatório.")

        for item_data in produtos_data:
            produto_id = item_data['produto_id']
            quantidade_vendida = item_data['quantidade']
            
            try:
                estoque_studio = EstoqueStudio.objects.get(produto_id=produto_id, studio_id=studio_id)
                if estoque_studio.quantidade < quantidade_vendida:
                    produto_nome = Produto.objects.get(pk=produto_id).nome
                    raise serializers.ValidationError(
                        f"Estoque insuficiente para o produto '{produto_nome}' no estúdio."
                    )
            except EstoqueStudio.DoesNotExist:
                produto_nome = Produto.objects.get(pk=produto_id).nome
                raise serializers.ValidationError(
                    f"Estoque não encontrado para o produto '{produto_nome}' no estúdio."
                )

        # Calcular valor_total com base nos produtos recebidos
        total_value = sum(item['preco_unitario'] * item['quantidade'] for item in produtos_data)
        validated_data['valor_total'] = total_value

        # Cria a instância da Venda
        venda = Venda.objects.create(**validated_data)

        # Cria as instâncias de VendaProduto e atualiza o estoque
        for item_data in produtos_data:
            produto = Produto.objects.get(pk=item_data['produto_id'])
            VendaProduto.objects.create(
                venda=venda,
                produto=produto,
                quantidade=item_data['quantidade'],
                preco_unitario=item_data['preco_unitario']
            )
            
            # Atualiza o estoque após a criação bem-sucedida do VendaProduto
            estoque_studio = EstoqueStudio.objects.get(produto=produto, studio=venda.studio)
            estoque_studio.quantidade -= item_data['quantidade']
            estoque_studio.save()

        return venda

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

# Novo serializer para produtos com estoque por estúdio
class ProdutoEstoqueSerializer(serializers.ModelSerializer):
    quantidade_em_estoque = serializers.SerializerMethodField()

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'quantidade_em_estoque']

    def get_quantidade_em_estoque(self, obj):
        """
        Este método busca a quantidade em estoque do produto (obj)
        para o estúdio específico passado no contexto.
        """
        studio_id = self.context.get('studio_id')
        if not studio_id:
            return None # Ou 0, dependendo da regra de negócio

        try:
            estoque = EstoqueStudio.objects.get(produto=obj, studio_id=studio_id)
            return estoque.quantidade
        except EstoqueStudio.DoesNotExist:
            return 0 # Se não há registro de estoque, a quantidade é 0

class ProdutoSerializer(serializers.ModelSerializer):
    estoque_studios = EstoqueStudioSerializer(many=True, read_only=True, source='estoquestudio_set')

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'estoque_studios']
        
class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'
