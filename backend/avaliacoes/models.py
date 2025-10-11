from django.db import models
from alunos.models import Aluno
from usuarios.models import Colaborador
from agendamentos.models import Aula

class Avaliacao(models.Model):
    """ Armazena a avaliação inicial e reavaliações de um aluno. """
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="avaliacoes")
    instrutor = models.ForeignKey(Colaborador, on_delete=models.PROTECT, related_name="avaliacoes_realizadas")
    data_avaliacao = models.DateTimeField(auto_now_add=True)
    diagnostico = models.TextField(blank=True)
    historico_medico = models.TextField(blank=True)
    data_proxima_reavaliacao = models.DateField(null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_ultima_modificacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'avaliacoes'

class RegistroClinico(models.Model):
    """ Armazena a evolução (Fisio) ou planejamento (Ed. Física) de uma aula. """
    class TipoRegistro(models.TextChoices):
        EVOLUCAO = 'EVOLUCAO', 'Evolução'
        PLANEJAMENTO = 'PLANEJAMENTO', 'Planejamento'

    avaliacao = models.ForeignKey(Avaliacao, on_delete=models.CASCADE, related_name="registros")
    colaborador = models.ForeignKey(Colaborador, on_delete=models.PROTECT)
    aula = models.ForeignKey(Aula, on_delete=models.SET_NULL, null=True, blank=True)
    tipo = models.CharField(max_length=20, choices=TipoRegistro.choices)
    descricao = models.TextField()
    data_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'registros_clinicos'
        ordering = ['-data_registro']