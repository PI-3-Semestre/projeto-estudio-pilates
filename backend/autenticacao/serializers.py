# autenticacao/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

# CORREÇÃO: Importa o modelo 'Usuario' do app 'usuarios'
from usuarios.models import Usuario
# REMOVIDO: A importação de 'ColaboradorStudio' foi removida, 
# pois o app 'unidades' não faz parte desta branch.
# from unidades.models import ColaboradorStudio


# REMOVIDO: Todo este serializer foi comentado porque ele depende do
# modelo 'ColaboradorStudio' do app 'unidades'.
# class PermissaoSerializer(serializers.ModelSerializer):
#     """ Serializer para exibir as permissões de um colaborador em um studio. """
#     studio_id = serializers.IntegerField(source='studio.id')
#     studio_nome = serializers.CharField(source='studio.nome')
#
#     class Meta:
#         model = ColaboradorStudio
#         fields = ['studio_id', 'studio_nome', 'permissao']


class PerfilColaboradorSerializer(serializers.ModelSerializer):
    """ Serializer para exibir os dados do perfil do colaborador. """
    
    # REMOVIDO: O campo 'permissoes' foi comentado por depender do PermissaoSerializer.
    # permissoes = PermissaoSerializer(source='colaboradorstudio_set', many=True, read_only=True)

    class Meta:
        # CORREÇÃO: O modelo agora é 'Usuario'.
        model = Usuario
        # ATENÇÃO: Os campos abaixo precisam existir no seu modelo 'Usuario'.
        # O campo 'permissoes' foi removido da lista.
        fields = ['id', 'email', 'first_name', 'last_name', 'cpf']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de login customizado.
    Adiciona os dados do perfil e as permissões do usuário à resposta do login.
    """
    def validate(self, attrs):
        # O método 'validate' padrão do SimpleJWT já cuida da autenticação
        data = super().validate(attrs)

        # 'self.user' é o objeto do usuário autenticado (que é uma instância de 'Usuario')
        user = self.user
        
        # Usamos o serializer de perfil para obter os dados formatados do usuário
        perfil_serializer = PerfilColaboradorSerializer(user)
        
        # Adicionamos os dados do perfil à resposta do token
        data['user'] = perfil_serializer.data

        return data