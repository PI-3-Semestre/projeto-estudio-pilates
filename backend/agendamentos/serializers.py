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

class BloqueioAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueioAgenda
        fields = '__all__'

class ModalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidade
        fields = '__all__'

class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = '__all__'

class AulaAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AulaAluno
        fields = '__all__'
class AgendamentoAlunoSerializer(serializers.ModelSerializer):
    """
    Serializer para o "Fluxo Aluno". 
    O aluno é automaticamente definido como o usuário logado.
    """
    class Meta:
        model = AulaAluno
        fields = ['id', 'aula', 'aluno', 'status_presenca']
        
        # impede que o aluno passe no json
        read_only_fields = ['aluno']
        
class AgendamentoStaffSerializer(serializers.ModelSerializer):
    """
    Serializer para o "Fluxo Staff".
    Permite que o staff defina para qual 'aluno' o agendamento está sendo feito.
    """
    class Meta:
        model = AulaAluno
        fields = ['id', 'aula', 'aluno', 'status_presenca']
        # aluno para ser editável depois 

class ReposicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reposicao
        fields = '__all__'

class ListaEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListaEspera
        fields = '__all__'
