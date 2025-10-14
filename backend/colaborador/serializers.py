from rest_framework import serializers
from .models import Cargo, Endereco, Colaborador
from studios.models import ColaboradorStudio

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = '__all__'

class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'

class ColaboradorStudioSerializer(serializers.ModelSerializer):
    """
    Serializer para o vínculo entre Colaborador e Studio, mostrando 
    o nome do studio e a permissão do colaborador nele.
    """
    studio_nome = serializers.CharField(source='studio.nome', read_only=True)

    class Meta:
        model = ColaboradorStudio
        fields = ['studio', 'studio_nome', 'permissao']

class ColaboradorSerializer(serializers.ModelSerializer):
    endereco = EnderecoSerializer()
    cargo_nome = serializers.CharField(source='cargo.nome', read_only=True)
    cargo = serializers.PrimaryKeyRelatedField(queryset=Cargo.objects.all(), write_only=True)
    vinculos_studio = ColaboradorStudioSerializer(many=True, read_only=True)

    class Meta:
        model = Colaborador
        fields = [
            'id', 'nome', 'cpf', 'data_nascimento', 'telefone', 'email',
            'password', 'data_admissao', 'data_demissao', 'salario', 'status',
            'cargo', 'cargo_nome', 'endereco', 'is_active', 'date_joined',
            'vinculos_studio'
        ]
        read_only_fields = ['is_active', 'date_joined']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        endereco_data = validated_data.pop('endereco')
        endereco = Endereco.objects.create(**endereco_data)
        
        password = validated_data.pop('password', None)
        colaborador = Colaborador.objects.create(endereco=endereco, **validated_data)
        if password:
            colaborador.set_password(password)
            colaborador.save()
        return colaborador

    def update(self, instance, validated_data):
        if 'endereco' in validated_data:
            endereco_data = validated_data.pop('endereco')
            endereco_serializer = EnderecoSerializer(instance.endereco, data=endereco_data, partial=True)
            if endereco_serializer.is_valid(raise_exception=True):
                endereco_serializer.save()

        return super().update(instance, validated_data)
