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

class BloqueioAgendaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueioAgenda
        fields = ['id', 'data', 'descricao', 'studio']

class BloqueioAgendaReadSerializer(serializers.ModelSerializer):
    studio = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = BloqueioAgenda
        fields = ['id', 'data', 'descricao', 'studio']
        
class AulaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = [
            "data_hora_inicio",
            "capacidade_maxima",
            "duracao_minutos",
            "tipo_aula",
            "modalidade",
            "studio",
            "instrutor_principal",
            "instrutor_substituto",
        ]

class AulaReadSerializer(serializers.ModelSerializer):
    modalidade = ModalidadeSerializer(read_only=True)
    instrutor_principal = serializers.StringRelatedField(read_only=True)
    instrutor_substituto = serializers.StringRelatedField(read_only=True)
    studio = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Aula
        fields = [
            "id",
            "data_hora_inicio",
            "capacidade_maxima",
            "duracao_minutos",
            "tipo_aula",
            "modalidade",
            "studio",
            "instrutor_principal",
            "instrutor_substituto",
        ]