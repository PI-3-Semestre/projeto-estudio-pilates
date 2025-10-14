from django.db import models
from usuarios.models import Colaborador
from alunos.models import Aluno
# Create your models here.

class Avaliacao(models.Model):
    # Relações
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="avaliacoes")
    # O instrutor que realizou a avaliação. PROTECT impede que um colaborador seja deletado se tiver avaliações associadas.
    # instrutor nulo para que nao precise criar o insturtor por enquanto
    instrutor = models.ForeignKey(Colaborador, on_delete=models.PROTECT, related_name="avaliacoes_realizadas", null=True, blank=True)
    
    data_avaliacao = models.DateField(verbose_name="Data de Avaliação")
    diagnostico_fisioterapeutico = models.TextField(verbose_name="Diagnóstico Fisioterapeutico", blank=True, null=True)
    historico_medico = models.TextField(verbose_name="Histórico Médico", blank=True, null=True)
    patologias = models.TextField(verbose_name="Patologias", blank=True, null=True)
    exames_complementares = models.TextField(verbose_name="Exames Complementares", blank=True, null=True)
    medicamentos_em_uso = models.TextField("Medicamentos em Uso", blank=True, null=True)
    tratamentos_realizados = models.TextField(verbose_name="Tratamentos Anteriores", blank=True, null=True)
    objetivo_aluno = models.TextField("Objetivo do Aluno")
    foto_avaliacao_postural = models.ImageField(upload_to='avaliacoes/', verbose_name="Foto da Avaliação Postural", null=True, blank=True)
    data_reavalicao = models.DateField(verbose_name="Data para Reavaliação", blank=True, null=True)
    
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_ultima_modificacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'avaliacoes'
        ordering = ['-data_avaliacao'] # Opcional: mostra as avaliações mais recentes primeiro

    def __str__(self):
        return f"Avaliação de {self.aluno.nome} em {self.data_avaliacao.strftime('%d/%m/%Y')}"


class RegistroClinico(models.Model):
    """ Armazena a evolução (Fisio) ou planejamento (Ed. Física) de uma aula. """
    class TipoRegistro(models.TextChoices):
        EVOLUCAO = 'EVOLUCAO', 'Evolução'
        PLANEJAMENTO = 'PLANEJAMENTO', 'Planejamento'

    avaliacao = models.ForeignKey(Avaliacao, on_delete=models.CASCADE, related_name="registros")
    colaborador = models.ForeignKey(Colaborador, on_delete=models.PROTECT)
    tipo = models.CharField(max_length=20, choices=TipoRegistro.choices)
    descricao = models.TextField()
    data_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'registros_clinicos'
        ordering = ['-data_registro']