# usuarios/serializers.py
from rest_framework import serializers
from django.db import IntegrityError
from .models import Usuario, Colaborador, Endereco, Perfil
from studios.models import Studio, ColaboradorStudio, FuncaoOperacional


class PerfilSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Perfil. Retorna o ID e o nome legível do perfil.
    """
    nome = serializers.CharField(source='get_nome_display', read_only=True)

    class Meta:
        model = Perfil
        fields = ['id', 'nome']


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
    
    tipo_usuario = serializers.SerializerMethodField(help_text="Tipo de perfil do usuário (Aluno, Colaborador, etc.).")

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'cpf', 'nome_completo', 'definir_nome_completo', 'is_active', 'tipo_usuario']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_nome_completo(self, obj) -> str:
        """Método para obter o valor do campo 'nome_completo'."""
        return obj.get_full_name()
    
    def get_tipo_usuario(self, obj: Usuario) -> str | None:
        """
        Verifica se o usuário tem um perfil de Aluno ou Colaborador associado.
        """
        # hasattr verifica se a relação (ex: obj.aluno) existe
        if hasattr(obj, 'aluno'):
            return "Aluno"
        if hasattr(obj, 'colaborador'):
            return "Colaborador"
        if obj.is_superuser:
            return "Admin Master"
        return None # Ou "Usuário" se preferir

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
            instance.usuario.first_name = parts[0]
            instance.usuario.last_name = parts[1] if len(parts) > 1 else ''
            instance.usuario.save()

        return super().update(instance, validated_data)


class ColaboradorStudioWriteSerializer(serializers.Serializer):
    """Serializer auxiliar para a escrita da relação Colaborador-Studio."""
    studio_id = serializers.IntegerField()
    permissao_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

    def validate_studio_id(self, value):
        """Verifica se o Studio com o ID fornecido existe."""
        if not Studio.objects.filter(pk=value).exists():
            raise serializers.ValidationError(f"Studio com id={value} não existe.")
        return value

    def validate_permissao_ids(self, values):
        """Verifica se todas as FuncoesOperacionais com os IDs fornecidos existem."""
        for value in values:
            if not FuncaoOperacional.objects.filter(pk=value).exists():
                raise serializers.ValidationError(f"Permissão com id={value} não existe.")
        return values


class ColaboradorStudioReadSerializer(serializers.ModelSerializer):
    """Serializer para leitura da relação Colaborador-Studio, mostrando o nome do studio."""
    studio_nome = serializers.CharField(source='studio.nome', read_only=True)
    studio_id = serializers.IntegerField(source='studio.id', read_only=True)
    permissao = serializers.IntegerField(source='permissao_id', read_only=True)

    class Meta:
        model = ColaboradorStudio
        fields = ['studio_id', 'studio_nome', 'permissao']


class ColaboradorSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Colaborador. Gerencia o perfil profissional do usuário.
    """
    perfis = PerfilSerializer(many=True, read_only=True)
    perfis_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    endereco = EnderecoSerializer()
    nome_completo = serializers.CharField(source='usuario.get_full_name', read_only=True)
    definir_nome_completo = serializers.CharField(write_only=True, required=False, help_text="Defina o nome completo para atualizar o usuário relacionado.")
    
    unidades = ColaboradorStudioReadSerializer(source='vinculos_studio', many=True, read_only=True)
    vinculos_studio = ColaboradorStudioWriteSerializer(many=True, write_only=True)

    class Meta:
        model = Colaborador
        fields = [
            'usuario', 'nome_completo', 'definir_nome_completo', 'perfis', 'perfis_ids',
            'registro_profissional', 'data_nascimento', 'telefone', 'data_admissao',
            'data_demissao', 'status', 'endereco', 'unidades', 'vinculos_studio'
        ]

    def create(self, validated_data):
        """Cria um novo perfil de Colaborador, seu Endereço e os vínculos com Studios."""
        validated_data.pop('definir_nome_completo', None)
        endereco_data = validated_data.pop('endereco')
        vinculos_data = validated_data.pop('vinculos_studio')
        perfis_ids = validated_data.pop('perfis_ids', [])
        usuario = validated_data.pop('usuario')

        endereco = Endereco.objects.create(**endereco_data)
        
        try:
            colaborador = Colaborador.objects.create(usuario=usuario, endereco=endereco, **validated_data)
        except IntegrityError:
            raise serializers.ValidationError({"usuario": "Já existe um colaborador para este usuário."})

        if perfis_ids:
            colaborador.perfis.set(perfis_ids)

        for vinculo_data in vinculos_data:
            studio_id = vinculo_data['studio_id']
            for permissao_id in vinculo_data['permissao_ids']:
                ColaboradorStudio.objects.create(
                    colaborador=colaborador,
                    studio_id=studio_id,
                    permissao_id=permissao_id
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
            instance.vinculos_studio.all().delete()
            for vinculo_data in vinculos_data:
                studio_id = vinculo_data['studio_id']
                for permissao_id in vinculo_data['permissao_ids']:
                    ColaboradorStudio.objects.create(
                        colaborador=instance,
                        studio_id=studio_id,
                        permissao_id=permissao_id
                    )
        
        if 'perfis_ids' in validated_data:
            perfis_ids = validated_data.pop('perfis_ids')
            instance.perfis.set(perfis_ids)

        return super().update(instance, validated_data)
