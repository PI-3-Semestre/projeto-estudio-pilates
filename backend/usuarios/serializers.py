# usuarios/serializers.py
from rest_framework import serializers
from .models import Usuario, Colaborador, Endereco
from studios.models import Studio, ColaboradorStudio

class EnderecoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Endereco. Converte o objeto Endereco para JSON e vice-versa.
    """
    class Meta:
        model = Endereco
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Usuario. Lida com a criação e atualização de contas de usuário.
    """
    nome_completo = serializers.SerializerMethodField(help_text="Nome completo do usuário (para leitura).")
    definir_nome_completo = serializers.CharField(write_only=True, required=False, help_text="Defina o nome completo. Ex: 'Nome Sobrenome'.")

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'cpf', 'nome_completo', 'definir_nome_completo']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_nome_completo(self, obj) -> str:
        """Método para obter o valor do campo 'nome_completo'."""
        return obj.get_full_name()

    def create(self, validated_data):
        """Cria um novo usuário, tratando o nome completo e hasheando a senha."""
        if 'definir_nome_completo' not in validated_data:
            raise serializers.ValidationError({'definir_nome_completo': 'Este campo é obrigatório na criação.'})
            
        nome_completo = validated_data.pop('definir_nome_completo', '')
        parts = nome_completo.split(' ', 1)
        validated_data['first_name'] = parts[0]
        validated_data['last_name'] = parts[1] if len(parts) > 1 else ''

        user = Usuario.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """Atualiza um usuário existente, com lógica para alterar o nome completo."""
        if 'definir_nome_completo' in validated_data:
            nome_completo = validated_data.pop('definir_nome_completo')
            parts = nome_completo.split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
        
        return super().update(instance, validated_data)


class ColaboradorStudioWriteSerializer(serializers.Serializer):
    """Serializer auxiliar para a escrita da relação Colaborador-Studio."""
    studio_id = serializers.IntegerField()
    permissao = serializers.ChoiceField(choices=ColaboradorStudio.PermissaoChoices.choices)


class ColaboradorStudioReadSerializer(serializers.ModelSerializer):
    """Serializer para leitura da relação Colaborador-Studio, mostrando o nome do studio."""
    studio_nome = serializers.CharField(source='studio.nome', read_only=True)
    studio_id = serializers.IntegerField(source='studio.id', read_only=True)

    class Meta:
        model = ColaboradorStudio
        fields = ['studio_id', 'studio_nome', 'permissao']


class ColaboradorSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Colaborador. Gerencia o perfil profissional do usuário.
    """
    endereco = EnderecoSerializer()
    nome_completo = serializers.CharField(source='usuario.get_full_name', read_only=True)
    definir_nome_completo = serializers.CharField(write_only=True, required=False, help_text="Defina o nome completo para atualizar o usuário relacionado.")
    
    # Campo para LEITURA da relação com studios
    unidades = ColaboradorStudioReadSerializer(source='vinculos_studio', many=True, read_only=True)
    # Campo para ESCRITA da relação com studios
    vinculos_studio = ColaboradorStudioWriteSerializer(many=True, write_only=True)

    class Meta:
        model = Colaborador
        fields = [
            'usuario', 'nome_completo', 'definir_nome_completo', 'perfis',
            'registro_profissional', 'data_nascimento', 'telefone', 'data_admissao',
            'data_demissao', 'status', 'endereco', 'unidades', 'vinculos_studio'
        ]
        extra_kwargs = {
            'usuario': {'read_only': True} # Usuário é definido na criação e não deve ser alterado.
        }

    def create(self, validated_data):
        """Cria um novo perfil de Colaborador, seu Endereço e os vínculos com Studios."""
        validated_data.pop('definir_nome_completo', None)
        endereco_data = validated_data.pop('endereco')
        vinculos_data = validated_data.pop('vinculos_studio')

        endereco = Endereco.objects.create(**endereco_data)
        colaborador = Colaborador.objects.create(endereco=endereco, **validated_data)

        for vinculo_data in vinculos_data:
            ColaboradorStudio.objects.create(
                colaborador=colaborador,
                studio_id=vinculo_data['studio_id'],
                permissao=vinculo_data['permissao']
            )

        return colaborador

    def update(self, instance, validated_data):
        """Atualiza um Colaborador, incluindo seu nome, endereço e os vínculos com studios."""
        if 'definir_nome_completo' in validated_data:
            nome_completo = validated_data.pop('definir_nome_completo')
            parts = nome_completo.split(' ', 1)
            instance.usuario.first_name = parts[0]
            instance.usuario.last_name = parts[1] if len(parts) > 1 else ''
            instance.usuario.save()

        if 'endereco' in validated_data:
            endereco_data = validated_data.pop('endereco')
            EnderecoSerializer().update(instance.endereco, endereco_data)

        if 'vinculos_studio' in validated_data:
            vinculos_data = validated_data.pop('vinculos_studio')
            # Apaga os vínculos antigos
            instance.vinculos_studio.all().delete()
            # Cria os novos vínculos
            for vinculo_data in vinculos_data:
                ColaboradorStudio.objects.create(
                    colaborador=instance,
                    studio_id=vinculo_data['studio_id'],
                    permissao=vinculo_data['permissao']
                )

        # Chama o super para atualizar os campos restantes do Colaborador
        return super().update(instance, validated_data)