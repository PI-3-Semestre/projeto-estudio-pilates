from rest_framework import serializers
from .models import Aluno, AvaliacaoInicial

class AlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aluno
        fields = [
            'id',
            'nome',
            'foto',
            'dataNascimento',
            'cpf',
            'email',
            'contato',
            'profissao',
            'email_verificado',
        ]

        read_only_fields = ['email_verificado']

class AvaliacaoInicialSerializer(serializers.ModelSerializer):
    """
    Serializer para criar uma Avaliação Inicial para um Aluno existente.
    """
    class Meta:
        model = AvaliacaoInicial
        fields = '__all__'
        # O campo 'aluno' será um campo apenas de leitura no JSON de resposta.
        # Nós vamos preenchê-lo a partir da URL na nossa view, não do corpo da requisição.
        read_only_fields = ['aluno']