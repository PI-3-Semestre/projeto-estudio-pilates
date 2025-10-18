# autenticacao/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from usuarios.models import Colaborador

class PerfilColaboradorSerializer(serializers.ModelSerializer):
    """ Serializer para exibir os dados do perfil do colaborador. """
    
    nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.CharField(source='usuario.email', read_only=True)
    cpf = serializers.CharField(source='usuario.cpf', read_only=True)
    # Retorna os nomes dos perfis (ex: ["Administrador", "Instrutor"])
    perfis = serializers.StringRelatedField(many=True)

    class Meta:
        model = Colaborador
        fields = ['usuario', 'email', 'nome', 'cpf', 'perfis']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de login customizado.
    Adiciona os dados do perfil do usuário à resposta do login.
    """
    def validate(self, attrs):
        data = super().validate(attrs)

        try:
            user = self.user.colaborador
        except Colaborador.DoesNotExist:
            return data
        
        perfil_serializer = PerfilColaboradorSerializer(user)
        data['user'] = perfil_serializer.data

        return data
