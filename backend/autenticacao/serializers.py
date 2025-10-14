# autenticacao/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

# CORREÇÃO: Importa o modelo 'Colaborador' correto
from colaborador.models import Colaborador

class PerfilColaboradorSerializer(serializers.ModelSerializer):
    """ Serializer para exibir os dados do perfil do colaborador. """
    
    cargo_nome = serializers.CharField(source='cargo.nome', read_only=True, default=None)

    class Meta:
        # CORREÇÃO: O modelo agora é 'Colaborador'.
        model = Colaborador
        # CORREÇÃO: Campos ajustados para o modelo Colaborador.
        fields = ['id', 'email', 'nome', 'cpf', 'cargo_nome']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de login customizado.
    Adiciona os dados do perfil do usuário à resposta do login.
    """
    def validate(self, attrs):
        # O método 'validate' padrão do SimpleJWT já cuida da autenticação
        data = super().validate(attrs)

        # 'self.user' é uma instância de 'Colaborador'
        user = self.user
        
        # Usamos o serializer de perfil para obter os dados formatados do usuário
        perfil_serializer = PerfilColaboradorSerializer(user)
        
        # Adicionamos os dados do perfil à resposta do token
        data['user'] = perfil_serializer.data

        return data