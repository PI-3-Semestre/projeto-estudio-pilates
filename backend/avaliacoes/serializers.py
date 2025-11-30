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
    foto_avaliacao_postural = Base64ImageField(required=False, allow_null=True)
    
    instrutor_nome = CharField(source='instrutor.usuario.get_full_name', read_only=True)
    
    aluno_nome = CharField(source='aluno.usuario.get_full_name', read_only=True)

    class Meta:
        model = Avaliacao
        
        fields = [
            'id', 
            'aluno',
            'aluno_nome', 
            'instrutor', 
            'instrutor_nome',
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
            'data_criacao', 
            'data_ultima_modificacao',
            'studio',
        ]
        read_only_fields = ['aluno', 'instrutor']