# usuarios/serializers.py
from rest_framework import serializers
from .models import Usuario, Colaborador, Endereco

class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    # Campo para LEITURA (GET)
    nome_completo = serializers.SerializerMethodField()
    # Campo para ESCRITA (POST/PATCH)
    definir_nome_completo = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'cpf', 'nome_completo', 'definir_nome_completo']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_nome_completo(self, obj):
        return obj.get_full_name()

    def create(self, validated_data):
        # O campo 'definir_nome_completo' é obrigatório na criação
        if 'definir_nome_completo' not in validated_data:
            raise serializers.ValidationError({'definir_nome_completo': 'Este campo é obrigatório.'})
            
        nome_completo = validated_data.pop('definir_nome_completo', '')
        parts = nome_completo.split(' ', 1)
        validated_data['first_name'] = parts[0]
        validated_data['last_name'] = parts[1] if len(parts) > 1 else ''

        user = Usuario.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        if 'definir_nome_completo' in validated_data:
            nome_completo = validated_data.pop('definir_nome_completo')
            parts = nome_completo.split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
        
        # Salva outras possíveis alterações (ex: username, email)
        return super().update(instance, validated_data)

class ColaboradorSerializer(serializers.ModelSerializer):
    # Serializer aninhado para o endereço
    endereco = EnderecoSerializer()
    # Campo para LEITURA (GET)
    nome_completo = serializers.SerializerMethodField()
    # Campo para ESCRITA (PATCH)
    definir_nome_completo = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Colaborador
        # 'nome_completo' foi removido dos fields para evitar o AttributeError.
        fields = [
            'usuario',
            'nome_completo',
            'definir_nome_completo',
            'perfis',
            'registro_profissional',
            'data_nascimento',
            'telefone',
            'data_admissao',
            'data_demissao',
            'status',
            'endereco',
            'unidades'
        ]
        extra_kwargs = {
            'usuario': {'write_only': True}
        }

    def get_nome_completo(self, obj):
        return obj.usuario.get_full_name()

    def create(self, validated_data):
        # A criação de colaborador não lida com 'nome_completo' diretamente,
        # pois assume que o usuário já foi criado com o nome correto.
        validated_data.pop('definir_nome_completo', None)  # Remove se foi passado
        endereco_data = validated_data.pop('endereco')
        unidades_data = validated_data.pop('unidades')

        endereco = Endereco.objects.create(**endereco_data)
        colaborador = Colaborador.objects.create(endereco=endereco, **validated_data)
        colaborador.unidades.set(unidades_data)

        return colaborador

    def update(self, instance, validated_data):
        # Lógica para atualizar o nome/sobrenome do usuário a partir do nome_completo
        if 'definir_nome_completo' in validated_data:
            nome_completo = validated_data.pop('definir_nome_completo')
            parts = nome_completo.split(' ', 1)
            instance.usuario.first_name = parts[0]
            instance.usuario.last_name = parts[1] if len(parts) > 1 else ''
            instance.usuario.save()

        # Lógica para atualizar o endereço se ele for fornecido
        if 'endereco' in validated_data:
            endereco_data = validated_data.pop('endereco')
            endereco_serializer = self.fields['endereco']
            endereco_instance = instance.endereco
            endereco_serializer.update(endereco_instance, endereco_data)

        # Lógica para atualizar as unidades se elas forem fornecidas
        if 'unidades' in validated_data:
            unidades_data = validated_data.pop('unidades')
            instance.unidades.set(unidades_data)

        # Atualiza os campos restantes do colaborador
        return super().update(instance, validated_data)
