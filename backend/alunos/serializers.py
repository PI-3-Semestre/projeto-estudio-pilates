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
    # Campo para upload de foto em base64. Não é obrigatório.
    foto = Base64ImageField(required=False, allow_null=True)
    
    # Campos somente leitura, obtidos do modelo Usuario relacionado.
    # Isso garante que os dados de identidade do aluno venham de uma única fonte (Usuario).
    nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    cpf = serializers.CharField(read_only=True) # O CPF é definido internamente, não pelo cliente.

    # Campo para representar a relação ManyToMany com Studio.
    # Retorna uma lista de IDs de Studio.
    unidades = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Studio.objects.all(),
        required=False
    )

    class Meta:
        model = Aluno
        fields = [
            'usuario', # ID do usuário (apenas escrita)
            'nome', # Nome do usuário (apenas leitura)
            'email', # Email do usuário (apenas leitura)
            'cpf', # CPF do aluno (apenas leitura)
            'foto',
            'dataNascimento',
            'contato',
            'profissao',
            'is_active', # Status do aluno
            'unidades', # Relação com as unidades/studios
        ]
        extra_kwargs = {
            # O campo 'usuario' é usado para associar o Aluno a um Usuario na criação.
            # É write_only para não ser exposto em GETs. Não é obrigatório em updates (PATCH).
            'usuario': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        """Cria um novo perfil de Aluno associado a um Usuario."""
        unidades_data = validated_data.pop('unidades', [])
        usuario = validated_data.get('usuario')

        # Validação para garantir que o usuário foi fornecido na criação.
        if not usuario:
            raise serializers.ValidationError({"usuario": "O campo de usuário é obrigatório para criar um aluno."})

        # Validação para impedir que um usuário seja associado a mais de um perfil de aluno.
        if Aluno.objects.filter(usuario=usuario).exists():
            raise serializers.ValidationError({"usuario": "Este usuário já está associado a um aluno."})

        # Cria o aluno, definindo o CPF a partir do usuário associado para manter a consistência.
        aluno = Aluno.objects.create(
            #cpf=usuario.cpf,
            **validated_data
        )
        
        # Associa as unidades ao aluno recém-criado.
        if unidades_data:
            aluno.unidades.set(unidades_data)
            
        return aluno

    def update(self, instance, validated_data):
        """Atualiza um perfil de Aluno existente."""
        # Trata o campo ManyToMany 'unidades' separadamente, se ele for fornecido.
        unidades_data = validated_data.pop('unidades', None)

        # Chama o método 'update' da superclasse para salvar os outros campos.
        instance = super().update(instance, validated_data)

        # Se 'unidades' foi passado na requisição, atualiza a relação.
        if unidades_data is not None:
            instance.unidades.set(unidades_data)
            
        return instance