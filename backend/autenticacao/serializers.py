from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from usuarios.models import Colaborador
from alunos.models import Aluno # Importar o modelo Aluno
from studios.models import Studio # Importar o modelo Studio

class StudioSerializer(serializers.ModelSerializer):
    """
    Serializer auxiliar para formatar os dados de um Studio.
    """
    class Meta:
        model = Studio
        fields = ['id', 'nome']

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

class PerfilAlunoSerializer(serializers.ModelSerializer):
    """
    Serializer auxiliar para formatar os dados do perfil de um aluno.
    Usado para aninhar os dados do usuário na resposta do login.
    """
    nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.CharField(source='usuario.email', read_only=True)
    cpf = serializers.CharField(source='usuario.cpf', read_only=True)
    unidades = StudioSerializer(many=True, read_only=True) # Adiciona o serializer de Studio para as unidades

    class Meta:
        model = Aluno
        fields = ['usuario', 'email', 'nome', 'cpf', 'dataNascimento', 'contato', 'profissao', 'unidades']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de login customizado que herda do padrão do simple-jwt.
    O objetivo é adicionar dados customizados (o perfil do usuário) à resposta do token.
    """
    def validate(self, attrs):
        data = super().validate(attrs)

        user_profile_data = None
        user_type = None

        try:
            colaborador_profile = self.user.colaborador
            perfil_serializer = PerfilColaboradorSerializer(colaborador_profile)
            user_profile_data = perfil_serializer.data
            user_type = 'colaborador'
            
            if colaborador_profile.perfis.filter(nome='ADMIN_MASTER').exists():
                user_type = 'admin_master'
            elif colaborador_profile.perfis.filter(nome='ADMINISTRADOR').exists():
                user_type = 'administrador'
            elif colaborador_profile.perfis.filter(nome='RECEPCIONISTA').exists():
                user_type = 'recepcionista'
            elif colaborador_profile.perfis.filter(nome='FISIOTERAPEUTA').exists():
                user_type = 'fisioterapeuta'
            elif colaborador_profile.perfis.filter(nome='INSTRUTOR').exists():
                user_type = 'instrutor'

        except Colaborador.DoesNotExist:
            try:
                aluno_profile = self.user.aluno
                perfil_serializer = PerfilAlunoSerializer(aluno_profile)
                user_profile_data = perfil_serializer.data
                user_type = 'aluno'
            except Aluno.DoesNotExist:
                user_profile_data = {
                    'id': self.user.id,
                    'username': self.user.username,
                    'email': self.user.email,
                    'is_superuser': self.user.is_superuser,
                    'is_staff': self.user.is_staff,
                }
                if self.user.is_superuser:
                    user_type = 'superuser'
                else:
                    user_type = 'usuario_generico'
        data['user'] = user_profile_data
        data['user_type'] = user_type
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar a redefinição de senha.
    Recebe um 'identifier' que pode ser o email ou o CPF do usuário.
    """
    identifier = serializers.CharField(max_length=255, write_only=True)

    def validate_identifier(self, value):
        # Esta validação é apenas para garantir que o campo não está vazio.
        if not value:
            raise serializers.ValidationError("O campo de identificador não pode ser vazio.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmar a redefinição de senha.
    Recebe o token, a nova senha e a confirmação da nova senha.
    """
    token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        """
        Verifica se as senhas coincidem.
        """
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "As senhas não coincidem."})
        return data