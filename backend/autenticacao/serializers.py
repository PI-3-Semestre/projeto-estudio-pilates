# autenticacao/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from usuarios.models import Colaborador

class PerfilColaboradorSerializer(serializers.ModelSerializer):
    """ 
    Serializer auxiliar para formatar os dados do perfil de um colaborador.
    Usado para aninhar os dados do usuário na resposta do login.
    """
    
    # Campos somente leitura que buscam dados do modelo Usuario relacionado.
    nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.CharField(source='usuario.email', read_only=True)
    cpf = serializers.CharField(source='usuario.cpf', read_only=True)
    
    # Usa StringRelatedField para obter a representação em string dos perfis (ex: "Administrador").
    perfis = serializers.StringRelatedField(many=True)

    class Meta:
        model = Colaborador
        # Campos a serem incluídos na resposta.
        fields = ['usuario', 'email', 'nome', 'cpf', 'perfis']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de login customizado que herda do padrão do simple-jwt.
    O objetivo é adicionar dados customizados (o perfil do usuário) à resposta do token.
    """
    def validate(self, attrs):
        # 1. Chama o método `validate` da classe pai.
        # Este método é o que de fato autentica o usuário (verifica senha) e,
        # se for sucesso, retorna um dicionário com os tokens `access` e `refresh`.
        # Se a autenticação falhar, ele levanta uma exceção e o código abaixo não executa.
        data = super().validate(attrs)

        # 2. Se a autenticação foi bem-sucedida, `self.user` conterá o objeto do usuário.
        try:
            # Tenta acessar o perfil de colaborador associado ao usuário.
            colaborador_profile = self.user.colaborador
        except Colaborador.DoesNotExist:
            # Se o usuário não tem um perfil de colaborador (ex: é um aluno ou um superuser sem perfil),
            # simplesmente retorna os tokens sem dados extras de perfil.
            return data
        
        # 3. Se um perfil de colaborador foi encontrado, serializa seus dados.
        perfil_serializer = PerfilColaboradorSerializer(colaborador_profile)
        
        # 4. Adiciona os dados do perfil serializado à resposta final, sob a chave 'user'.
        data['user'] = perfil_serializer.data

        return data