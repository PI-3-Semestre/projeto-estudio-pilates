from rest_framework.serializers import ModelSerializer, CharField
from avaliacoes.models import Avaliacao
from drf_extra_fields.fields import Base64ImageField

class AvaliacaoSerializer(ModelSerializer):
    """
    Serializer para criar, listar e detalhar Avaliações de um Aluno.
    """
    # Permite que o front-end envie a imagem como uma string base64
    foto_avaliacao_postural = Base64ImageField(required=False, allow_null=True)
    
    # Campo para mostrar o nome do instrutor (apenas leitura)
    instrutor_nome = CharField(source='instrutor.usuario.get_full_name', read_only=True)

    class Meta:
        model = Avaliacao
        # Lista explícita de todos os campos do modelo
        fields = [
            'id',
            'aluno',
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
        ]
        
        # O aluno e o instrutor serão associados na view, não enviados no JSON.
        read_only_fields = ['aluno', 'instrutor']