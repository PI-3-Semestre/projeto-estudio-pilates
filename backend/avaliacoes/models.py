from django.db import models
from usuarios.models import Aluno
# Create your models here.
class Avaliacao(models.Model):
    # Criando a relação um para um com o aluno e avalicao
    #on_delete=models.CASCADE significa que se um aluno for deletado, todas as suas avaliações também serão.
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="avalicoes")
    
    data_avaliacao = models.DateField(verbose_name = "Data de Avaliação")
    diagnostico_fisioterapeutico = models.TextField(verbose_name="Diagnóstico Fisioterapeutico", blank=True, null=True)
    historico_medico = models.TextField(verbose_name="Histórico Médico", blank=True, null=True)
    patologias = models.TextField(verbose_name="Patologias", blank=True, null=True)
    exames_complementares = models.TextField(verbose_name="Exames Complementares", blank=True, null=True)
    medicamentos_em_uso = models.TextField("Medicamentos em Uso", blank=True, null=True)
    tratamentos_realizados = models.TextField(verbose_name="Tratamentos Anteriores", blank=True, null=True)
    objetivo_aluno = models.TextField("Objetivo do Aluno")
    foto_avaliacao_postural = models.ImageField(upload_to='avaliacoes/', verbose_name="Foto da Avalização Postural", null=True, blank=True)
    data_reavalicao = models.DateField(verbose_name="Data para Reavaliação", blank=True, null=True)
    
    def __str__(self):
        # Isso ajuda a identificar a avaliação no painel de admin do Django
        return f"Avaliação de {self.aluno.nome} em {self.data_avaliacao.strftime('%d/%m/%Y')}"
