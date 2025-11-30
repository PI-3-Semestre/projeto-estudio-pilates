# alunos/serializers.py
from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from .models import Aluno
from studios.models import Studio

class AlunoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Aluno. Lida com a conversão de dados do Aluno 
    para JSON (leitura) e a validação de dados de entrada (escrita).
    """
    foto = Base64ImageField(required=False, allow_null=True)
    
    nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    cpf = serializers.CharField(read_only=True) # O CPF é definido internamente, não pelo cliente.
    usuario_id = serializers.IntegerField(source='usuario.id', read_only=True)

    unidades = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Studio.objects.all(),
        required=False
    )

    class Meta:
        model = Aluno
        fields = [
            'usuario',
            'usuario_id',
            'nome', 
            'email', 
            'cpf', 
            'foto',
            'dataNascimento',
            'contato',
            'profissao',
            'is_active',
            'unidades', 
        ]
        extra_kwargs = {
            'usuario': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        """Cria um novo perfil de Aluno associado a um Usuario."""
        unidades_data = validated_data.pop('unidades', [])
        usuario = validated_data.get('usuario')

        if not usuario:
            raise serializers.ValidationError({"usuario": "O campo de usuário é obrigatório para criar um aluno."})

        if Aluno.objects.filter(usuario=usuario).exists():
            raise serializers.ValidationError({"usuario": "Este usuário já está associado a um aluno."})

        aluno = Aluno.objects.create(
            **validated_data
        )
        
        if unidades_data:
            aluno.unidades.set(unidades_data)
            
        return aluno

    def update(self, instance, validated_data):
        """Atualiza um perfil de Aluno existente."""
        
        unidades_data = validated_data.pop('unidades', None)
        
        instance = super().update(instance, validated_data)

        if unidades_data is not None:
            instance.unidades.set(unidades_data)
            
        return instance