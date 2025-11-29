from django.db import models
from usuarios.models import Colaborador
from alunos.models import Aluno
from studios.models import Studio
# Create your models here.

class Avaliacao(models.Model):
    """
    Modelo para armazenar a avaliação física e funcional de um aluno.
    Contém o histórico médico, diagnóstico, objetivos e outros dados relevantes.
    """
    # --- Relacionamentos ---
    # Define a relação com o Aluno. Se um aluno for deletado, suas avaliações também serão (CASCADE).
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="avaliacoes")
    
    # Define o instrutor que realizou a avaliação.
    # PROTECT impede que um colaborador seja deletado se tiver avaliações associadas a ele.
    instrutor = models.ForeignKey(Colaborador, on_delete=models.PROTECT, related_name="avaliacoes_realizadas", null=True, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True, related_name='avaliacoes')
    
    # --- Campos da Avaliação ---
    data_avaliacao = models.DateField(verbose_name="Data de Avaliação")
    diagnostico_fisioterapeutico = models.TextField(verbose_name="Diagnóstico Fisioterapeutico", blank=True, null=True)
    historico_medico = models.TextField(verbose_name="Histórico Médico", blank=True, null=True)
    patologias = models.TextField(verbose_name="Patologias", blank=True, null=True)
    exames_complementares = models.TextField(verbose_name="Exames Complementares", blank=True, null=True)
    medicamentos_em_uso = models.TextField("Medicamentos em Uso", blank=True, null=True)
    tratamentos_realizados = models.TextField(verbose_name="Tratamentos Anteriores", blank=True, null=True)
    objetivo_aluno = models.TextField("Objetivo do Aluno")
    
    # Campo para armazenar uma foto da avaliação postural. O upload será na pasta 'avaliacoes'.
    foto_avaliacao_postural = models.ImageField(upload_to='avaliacoes/', verbose_name="Foto da Avaliação Postural", null=True, blank=True)
    
    data_reavalicao = models.DateField(verbose_name="Data para Reavaliação", blank=True, null=True)
    
    # --- Timestamps ---
    # Data de criação, preenchida automaticamente na primeira vez que o objeto é salvo.
    data_criacao = models.DateTimeField(auto_now_add=True)
    # Data da última modificação, atualizada toda vez que o objeto é salvo.
    data_ultima_modificacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'avaliacoes' # Nome da tabela no banco de dados.
        ordering = ['-data_avaliacao'] # Ordena as avaliações pela data, da mais recente para a mais antiga.
        verbose_name = "Avaliação" # Nome amigável para o singular.
        verbose_name_plural = "Avaliações" # Nome amigável para o plural.

    def __str__(self):
        """Representação em string do objeto, útil no admin do Django e para debugging."""
        aluno_nome = self.aluno.nome if self.aluno else "Aluno não definido"
        return f"Avaliação de {aluno_nome} em {self.data_avaliacao.strftime('%d/%m/%Y')}"


class RegistroClinico(models.Model):
    """ 
    Modelo para armazenar a evolução de um paciente (Fisioterapia) ou o planejamento 
    de uma aula (Ed. Física), associado a uma avaliação.
    """
    class TipoRegistro(models.TextChoices):
        EVOLUCAO = 'EVOLUCAO', 'Evolução' # Para Fisioterapia
        PLANEJAMENTO = 'PLANEJAMENTO', 'Planejamento' # Para Educação Física

    # --- Relacionamentos ---
    # Se a avaliação for deletada, todos os seus registros clínicos também serão.
    avaliacao = models.ForeignKey(Avaliacao, on_delete=models.CASCADE, related_name="registros")
    # Colaborador que fez o registro. PROTECT impede a exclusão do colaborador se houver registros.
    colaborador = models.ForeignKey(Colaborador, on_delete=models.PROTECT)
    
    # --- Campos do Registro ---
    tipo = models.CharField(max_length=20, choices=TipoRegistro.choices, verbose_name="Tipo de Registro")
    descricao = models.TextField(verbose_name="Descrição")
    
    # --- Timestamps ---
    data_registro = models.DateTimeField(auto_now_add=True, verbose_name="Data do Registro")
    
    class Meta:
        db_table = 'registros_clinicos'
        ordering = ['-data_registro']
        verbose_name = "Registro Clínico"
        verbose_name_plural = "Registros Clínicos"