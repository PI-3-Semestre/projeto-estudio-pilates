# usuarios/serializers.py
from rest_framework import serializers
from .models import Usuario, Colaborador, Endereco

class EnderecoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Endereco. Converte o objeto Endereco para JSON e vice-versa.
    """
    class Meta:
        model = Endereco
        # NOTA: Usar '__all__' é conveniente, mas para maior segurança e clareza,
        # é recomendado listar os campos explicitamente. Ex: fields = ['cep', 'rua', ...]
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Usuario. Lida com a criação e atualização de contas de usuário.
    """
    # Campo virtual para LEITURA (GET): Retorna o nome completo do usuário.
    nome_completo = serializers.SerializerMethodField(help_text="Nome completo do usuário (para leitura).")
    
    # Campo virtual para ESCRITA (POST/PATCH): Recebe um nome completo e o divide em nome e sobrenome.
    definir_nome_completo = serializers.CharField(write_only=True, required=False, help_text="Defina o nome completo. Ex: 'Nome Sobrenome'.")

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'cpf', 'nome_completo', 'definir_nome_completo']
        extra_kwargs = {
            # Garante que o campo de senha seja usado apenas para escrita (criação/atualização)
            # e nunca seja retornado em respostas da API.
            'password': {'write_only': True},
        }

    def get_nome_completo(self, obj):
        """Método para obter o valor do campo 'nome_completo'."""
        return obj.get_full_name()

    def create(self, validated_data):
        """Cria um novo usuário, tratando o nome completo e hasheando a senha."""
        if 'definir_nome_completo' not in validated_data:
            raise serializers.ValidationError({'definir_nome_completo': 'Este campo é obrigatório na criação.'})
            
        # Processa o nome completo para preencher first_name e last_name.
        nome_completo = validated_data.pop('definir_nome_completo', '')
        parts = nome_completo.split(' ', 1)
        validated_data['first_name'] = parts[0]
        validated_data['last_name'] = parts[1] if len(parts) > 1 else ''

        # Usa create_user para garantir que a senha seja hasheada corretamente.
        user = Usuario.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """Atualiza um usuário existente, com lógica para alterar o nome completo."""
        if 'definir_nome_completo' in validated_data:
            nome_completo = validated_data.pop('definir_nome_completo')
            parts = nome_completo.split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
        
        # Chama o método pai para salvar outras possíveis alterações (ex: username, email).
        return super().update(instance, validated_data)

class ColaboradorSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Colaborador. Gerencia o perfil profissional do usuário.
    """
    # Serializer aninhado para exibir e permitir a atualização do endereço.
    endereco = EnderecoSerializer()
    
    # Campo de leitura para o nome completo, obtido do modelo Usuario relacionado.
    nome_completo = serializers.SerializerMethodField(help_text="Nome completo do colaborador (para leitura).")
    
    # Campo de escrita para permitir a atualização do nome do usuário através do perfil de colaborador.
    definir_nome_completo = serializers.CharField(write_only=True, required=False, help_text="Defina o nome completo para atualizar o usuário relacionado.")

    class Meta:
        model = Colaborador
        fields = [
            'usuario', # ID do usuário relacionado
            'nome_completo', # Nome (leitura)
            'definir_nome_completo', # Nome (escrita)
            'perfis', # Perfis de permissão (ex: INSTRUTOR)
            'registro_profissional',
            'data_nascimento',
            'telefone',
            'data_admissao',
            'data_demissao',
            'status',
            'endereco', # Objeto de endereço aninhado
            'unidades' # Unidades de trabalho associadas
        ]
        extra_kwargs = {
            # O campo 'usuario' é usado para associar o colaborador a uma conta de usuário na criação.
            # É write_only para não ser exposto em GET, pois já temos o 'nome_completo'.
            'usuario': {'write_only': True}
        }

    def get_nome_completo(self, obj):
        """Obtém o nome completo do objeto Usuario relacionado."""
        return obj.usuario.get_full_name()

    def create(self, validated_data):
        """Cria um novo perfil de Colaborador e seu Endereço associado."""
        validated_data.pop('definir_nome_completo', None)  # Ignora no create.
        endereco_data = validated_data.pop('endereco')
        unidades_data = validated_data.pop('unidades')

        endereco = Endereco.objects.create(**endereco_data)
        colaborador = Colaborador.objects.create(endereco=endereco, **validated_data)
        colaborador.unidades.set(unidades_data)

        return colaborador

    def update(self, instance, validated_data):
        """Atualiza um Colaborador, incluindo seu nome, endereço e unidades."""
        # Lógica para atualizar o nome no modelo Usuario relacionado.
        if 'definir_nome_completo' in validated_data:
            nome_completo = validated_data.pop('definir_nome_completo')
            parts = nome_completo.split(' ', 1)
            instance.usuario.first_name = parts[0]
            instance.usuario.last_name = parts[1] if len(parts) > 1 else ''
            instance.usuario.save()

        # Lógica para atualizar o endereço aninhado.
        if 'endereco' in validated_data:
            endereco_data = validated_data.pop('endereco')
            EnderecoSerializer().update(instance.endereco, endereco_data)

        # Lógica para atualizar o campo ManyToMany de unidades.
        if 'unidades' in validated_data:
            unidades_data = validated_data.pop('unidades')
            instance.unidades.set(unidades_data)

        # Atualiza os campos restantes do colaborador.
        return super().update(instance, validated_data)
