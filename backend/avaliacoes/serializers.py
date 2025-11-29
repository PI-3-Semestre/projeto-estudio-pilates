from rest_framework.serializers import ModelSerializer, CharField, PrimaryKeyRelatedField
from avaliacoes.models import Avaliacao
from alunos.models import Aluno
from drf_extra_fields.fields import Base64ImageField

class AvaliacaoCreateSerializer(ModelSerializer):
    """
    Serializer otimizado para a CRIAÇÃO de uma nova avaliação.
    Recebe o ID do aluno diretamente no corpo do JSON.
    """
    aluno = PrimaryKeyRelatedField(queryset=Aluno.objects.all())
    foto_avaliacao_postural = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = Avaliacao
        # Inclui todos os campos que o front-end deve enviar
        fields = [
            'aluno',
            'data_avaliacao',
            'diagnostico_fisioterapeutico',
            'historico_medico',
            'patologias',
            'exames_complementares',
            'medicamentos_em_uso',
            'tratamentos_realizados',
            'objetivo_aluno',
            'foto_avaliacao_postural',
            'data_reavalicao',
        ]

class AvaliacaoSerializer(ModelSerializer):
    """
    Serializer para serializar (converter para JSON) e desserializar (validar dados de entrada)
    os dados das avaliações físicas dos alunos.
    """
    # Campo para upload de imagem em formato base64, facilitando a integração com front-ends.
    # Não é obrigatório e pode ser nulo.
    foto_avaliacao_postural = Base64ImageField(required=False, allow_null=True)
    
    # Campo somente leitura para expor o nome completo do instrutor associado.
    # Utiliza o `source` para acessar o nome através da relação `instrutor.usuario`.
    instrutor_nome = CharField(source='instrutor.usuario.get_full_name', read_only=True)
    
    # Campo somente leitura para expor o nome completo do aluno associado.
    # Utiliza o `source` para acessar o nome através da relação `aluno.usuario`.
    aluno_nome = CharField(source='aluno.usuario.get_full_name', read_only=True)

    class Meta:
        model = Avaliacao
        
        # Lista explícita de campos a serem incluídos na representação do serializer.
        fields = [
            'id', # ID da avaliação
            'aluno', # ID do aluno associado
            'aluno_nome', # Nome do aluno (somente leitura)
            'instrutor', # ID do instrutor associado
            'instrutor_nome', # Nome do instrutor (somente leitura)
            'data_avaliacao',
            'diagnostico_fisioterapeutico',
            'historico_medico',
            'patologias',
            'exames_complementares',
            'medicamentos_em_uso',
            'tratamentos_realizados',
            'objetivo_aluno',
            'foto_avaliacao_postural', # Campo para a foto
            'data_reavalicao',
            'data_criacao', # Data de criação (geralmente definida automaticamente)
            'data_ultima_modificacao', # Data de modificação (geralmente definida automaticamente)
            'studio',
        ]
        
        # Campos que não podem ser definidos diretamente pelo cliente ao criar/atualizar.
        # A lógica de negócio nas views é responsável por preencher estes campos.
        # Isso previne que um usuário mal-intencionado associe a avaliação a outro aluno/instrutor.
        read_only_fields = ['aluno', 'instrutor']