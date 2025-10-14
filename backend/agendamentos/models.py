from django.db import models
from alunos.models import Aluno
from usuarios.models import Colaborador, Unidade, Usuario

class Modalidade(models.Model):
    """ Representa uma modalidade de aula (ex: Pilates, Yoga). """
    nome = models.CharField(max_length=50, unique=True)
    
    class Meta:
        db_table = 'modalidades'
    def __str__(self):
        return self.nome

class Aula(models.Model):
    """ Representa uma aula na grade de horários do estúdio. """
    class TipoAula(models.TextChoices):
        REGULAR = 'REGULAR', 'Regular'
        EXPERIMENTAL = 'EXPERIMENTAL', 'Experimental'
        REPOSICAO = 'REPOSICAO', 'Reposição'
        
    studio = models.ForeignKey(Unidade, on_delete=models.CASCADE)
    modalidade = models.ForeignKey(Modalidade, on_delete=models.PROTECT)
    instrutor_principal = models.ForeignKey(Colaborador, related_name='aulas_principais', on_delete=models.PROTECT)
    instrutor_substituto = models.ForeignKey(Colaborador, related_name='aulas_substitutas', on_delete=models.SET_NULL, null=True, blank=True)
    data_hora_inicio = models.DateTimeField()
    duracao_minutos = models.IntegerField(default=60)
    capacidade_maxima = models.PositiveIntegerField()
    tipo_aula = models.CharField(max_length=20, choices=TipoAula.choices, default=TipoAula.REGULAR)
    alunos = models.ManyToManyField(Aluno, through='AulaAluno')
    
    class Meta:
        db_table = 'aulas'
    def __str__(self):
        return f"{self.modalidade} em {self.data_hora_inicio.strftime('%d/%m/%Y %H:%M')}"

class AulaAluno(models.Model):
    """ Tabela de ligação para registrar a presença de um aluno em uma aula. """
    class StatusPresenca(models.TextChoices):
        PRESENTE = 'PRESENTE', 'Presente'
        AUSENTE_COM_REPO = 'AUSENTE_COM_REPO', 'Ausente com Reposição'
        AUSENTE_SEM_REPO = 'AUSENTE_SEM_REPO', 'Ausente sem Reposição'
    
    aula = models.ForeignKey(Aula, on_delete=models.CASCADE)
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    status_presenca = models.CharField(max_length=20, choices=StatusPresenca.choices)
    
    class Meta:
        db_table = 'aulas_alunos'
        unique_together = [['aula', 'aluno']]

class Reposicao(models.Model):
    """ Controla os créditos de reposição de um aluno. """
    class StatusReposicao(models.TextChoices):
        DISPONIVEL = 'DISPONIVEL', 'Disponível'
        UTILIZADA = 'UTILIZADA', 'Utilizada'
        EXPIRADA = 'EXPIRADA', 'Expirada'
        
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="reposicoes")
    aula_origem = models.ForeignKey(Aula, on_delete=models.CASCADE, help_text="Aula que gerou o crédito de reposição.")
    data_expiracao = models.DateField()
    status = models.CharField(max_length=20, choices=StatusReposicao.choices, default=StatusReposicao.DISPONIVEL)
    
    class Meta:
        db_table = 'reposicoes'

class ListaEspera(models.Model):
    """ Gerencia a lista de espera para aulas lotadas. """
    class StatusEspera(models.TextChoices):
        AGUARDANDO = 'AGUARDANDO', 'Aguardando'
        NOTIFICADO = 'NOTIFICADO', 'Notificado'

    aula = models.ForeignKey(Aula, on_delete=models.CASCADE, related_name="lista_espera")
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="lista_espera")
    data_inscricao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=StatusEspera.choices, default=StatusEspera.AGUARDANDO)

    class Meta:
        db_table = 'lista_espera'
        ordering = ['data_inscricao']

class Notificacao(models.Model):
    """ Armazena notificações para os usuários. """
    class StatusNotificacao(models.TextChoices):
        NAO_LIDA = 'NAO_LIDA', 'Não Lida'
        LIDA = 'LIDA', 'Lida'

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="notificacoes")
    tipo = models.CharField(max_length=50)
    mensagem = models.TextField()
    status = models.CharField(max_length=20, choices=StatusNotificacao.choices, default=StatusNotificacao.NAO_LIDA)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notificacoes'
        ordering = ['-data_criacao']
