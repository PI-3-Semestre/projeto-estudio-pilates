# autenticacao/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

# CORREÇÃO: Importa o modelo 'Colaborador' correto
from usuarios.models import Colaborador

class PerfilColaboradorSerializer(serializers.ModelSerializer):
    """ Serializer para exibir os dados do perfil do colaborador. """
    
    nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.CharField(source='usuario.email', read_only=True)
    cpf = serializers.CharField(source='usuario.cpf', read_only=True)

    class Meta:
        # CORREÇÃO: O modelo agora é 'Colaborador'.
        model = Colaborador
        # CORREÇÃO: Campos ajustados para o modelo Colaborador.
        fields = ['usuario', 'email', 'nome', 'cpf', 'perfil']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de login customizado.
    Adiciona os dados do perfil do usuário à resposta do login.
    """
    def validate(self, attrs):
        # O método 'validate' padrão do SimpleJWT já cuida da autenticação
        data = super().validate(attrs)

        # 'self.user' é uma instância de 'Usuario', então precisamos pegar o colaborador relacionado
        try:
            user = self.user.colaborador
        except Colaborador.DoesNotExist:
            # Se não for um colaborador, apenas retorne o token sem dados de perfil
            return data
        
        # Usamos o serializer de perfil para obter os dados formatados do usuário
        perfil_serializer = PerfilColaboradorSerializer(user)
        
        # Adicionamos os dados do perfil à resposta do token
        data['user'] = perfil_serializer.data

        return data