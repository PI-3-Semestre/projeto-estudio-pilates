# alunos/serializers.py
from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from .models import Aluno

class AlunoSerializer(serializers.ModelSerializer):
    foto = Base64ImageField(required=False)
    # Campos do modelo Usuario para leitura
    nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)

    class Meta:
        model = Aluno
        fields = [
            'usuario',
            'nome',
            'email',
            'foto',
            'dataNascimento',
            'cpf',
            'contato',
            'profissao',
            'is_active',
        ]
        # O campo 'usuario' é apenas para criação/vinculo
        extra_kwargs = {
            'usuario': {'write_only': True}
        }