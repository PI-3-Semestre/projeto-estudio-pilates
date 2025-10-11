from rest_framework.serializers import ModelSerializer
from avaliacoes.models import Avaliacao

class AvaliacaoSerializer(ModelSerializer):
    """
    Serializer para criar uma Avaliação Inicial para um Aluno existente.
    """
    class Meta:
        model = Avaliacao
        fields = '__all__'
        # O campo 'aluno' será um campo apenas de leitura no JSON de resposta.
        # Nós vamos preenchê-lo a partir da URL na nossa view, não do corpo da requisição.
        read_only_fields = ['aluno']