# financeiro/serializers.py
from rest_framework import serializers
from .models import Plano, Matricula, Pagamento, Produto, Venda, Parcela, EstoqueStudio
from studios.models import Studio
from alunos.serializers import AlunoSerializer
from alunos.models import Aluno
from usuarios.models import Usuario 

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
    studio = serializers.PrimaryKeyRelatedField(queryset=Studio.objects.all(), write_only=True)
    studio_display = serializers.CharField(source='studio.nome', read_only=True)

    class Meta:
        model = Venda
        fields = ['id', 'aluno', 'data_venda', 'produtos', 'studio', 'studio_display']

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

class ProdutoSerializer(serializers.ModelSerializer):
    estoque_studios = EstoqueStudioSerializer(many=True, read_only=True, source='estoquestudio_set')

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'preco', 'estoque_studios']
        
class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'