from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from .models import Aluno

class AlunoSerializer(serializers.ModelSerializer):
    foto = Base64ImageField()
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
        ]
