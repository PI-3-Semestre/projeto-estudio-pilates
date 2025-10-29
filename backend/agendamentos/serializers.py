# agendamentos/serializers.py
from rest_framework import serializers
from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera
)

class HorarioTrabalhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioTrabalho
        fields = '__all__'

class AulaAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AulaAluno
        fields = '__all__'

class ReposicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reposicao
        fields = '__all__'

class ListaEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListaEspera
        fields = '__all__'

class ModalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidade
        fields = ['id', 'nome']

class BloqueioAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueioAgenda
        fields = ['id', 'data', 'descricao', 'studio']
        
class AulaWtriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = [
            "data_hora_inicio",
            "duracao_minutos",
            "capacidade_maxima",
            "tipo_aula",
            "modalidade",
            "studio",
            "instrutor_principal",
            "instrutor_substituto",
        ]

class AulaReadSerializer(serializers.ModelSerializer):
    modalidade = ModalidadeSerializer(read_only=True)
    instructor_principal=serializers.StringRelatetField(read_only=True)
    instructor_substituto=serializers.StringRelatedField(read_only=True)
    studio = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Aula
        field = [
            "id",
            "data_hora_inicio",
            "duracao_minutos",
            "capacidade_maxima",
            "tipo_aula",
            "modalidade",
            "studio",
            "instrutor_principal",
            "instrutor_substituto",
        ]
    
