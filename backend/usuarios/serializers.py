from rest_framework import serializers
from .models import Aluno

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
