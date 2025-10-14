# usuarios/serializers.py
from rest_framework import serializers
from .models import Usuario, Colaborador, Endereco

class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Cria o usuário usando o método create_user para hashear a senha
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ColaboradorSerializer(serializers.ModelSerializer):
    # Serializer aninhado para o endereço
    endereco = EnderecoSerializer()
    # Campo para exibir o nome completo do usuário
    nome_completo = serializers.CharField(source='usuario.get_full_name', read_only=True)

    class Meta:
        model = Colaborador
        # Inclui todos os campos do modelo Colaborador e o campo 'nome_completo'
        fields = [
            'usuario', 
            'nome_completo',
            'perfil', 
            'registro_profissional', 
            'cpf', 
            'data_nascimento', 
            'telefone', 
            'data_admissao', 
            'data_demissao', 
            'status', 
            'endereco',
            'unidades'
        ]
        # O campo 'usuario' é apenas para criação/vinculo, não precisa aparecer em listagens detalhadas
        extra_kwargs = {
            'usuario': {'write_only': True}
        }

    def create(self, validated_data):
        endereco_data = validated_data.pop('endereco')
        unidades_data = validated_data.pop('unidades')
        
        endereco = Endereco.objects.create(**endereco_data)
        colaborador = Colaborador.objects.create(endereco=endereco, **validated_data)
        colaborador.unidades.set(unidades_data)
        
        return colaborador

    def update(self, instance, validated_data):
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
