# agendamentos/models.py
from django.db import models
from studios.models import Studio
from usuarios.models import Colaborador
from alunos.models import Aluno


class HorarioTrabalho(models.Model):
    """
    Armazena a configuração de dias e horários de funcionamento por estúdio.
    """

    class DiaSemana(models.IntegerChoices):
        SEGUNDA = 0, "Segunda-feira"
        TERCA = 1, "Terça-feira"
        QUARTA = 2, "Quarta-feira"
        QUINTA = 3, "Quinta-feira"
        SEXTA = 4, "Sexta-feira"
        SABADO = 5, "Sábado"
        DOMINGO = 6, "Domingo"

    studio = models.ForeignKey(
        Studio, on_delete=models.CASCADE, related_name="horarios_trabalho"
    )
    dia_semana = models.IntegerField(choices=DiaSemana.choices)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

    class Meta:
        unique_together = ("studio", "dia_semana")
        verbose_name = "Horário de Trabalho"
        verbose_name_plural = "Horários de Trabalho"

    def __str__(self):
        return f"{self.studio.nome} - {self.get_dia_semana_display()}: {self.hora_inicio} às {self.hora_fim}"


class BloqueioAgenda(models.Model):
    """
    Armazena feriados e outras datas em que não haverá expediente.
    """

    studio = models.ForeignKey(
        Studio, on_delete=models.CASCADE, related_name="bloqueios"
    )
    data = models.DateField()
    descricao = models.CharField(max_length=255)

    class Meta:
        unique_together = ("studio", "data")
        verbose_name = "Bloqueio de Agenda"
        verbose_name_plural = "Bloqueios de Agenda"

    def __str__(self):
        return f"Bloqueio em {self.studio.nome} no dia {self.data}: {self.descricao}"


class Modalidade(models.Model):
    """
    Define as modalidades de aula oferecidas (ex: Pilates, Yoga).
    """

    nome = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nome


class Aula(models.Model):
    """
    A entidade central para uma aula agendada.
    """

    class TipoAula(models.TextChoices):
        REGULAR = "REGULAR", "Regular"
        EXPERIMENTAL = "EXPERIMENTAL", "Experimental"
        REPOSICAO = "REPOSICAO", "Reposição"

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name="aulas")
    modalidade = models.ForeignKey(
        Modalidade, on_delete=models.PROTECT, related_name="aulas"
    )
    instrutor_principal = models.ForeignKey(
        Colaborador,
        on_delete=models.SET_NULL,
        null=True,
        related_name="aulas_principais",
    )
    instrutor_substituto = models.ForeignKey(
        Colaborador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="aulas_substitutas",
    )
    data_hora_inicio = models.DateTimeField()
    duracao_minutos = models.PositiveIntegerField(default=60)
    capacidade_maxima = models.PositiveIntegerField(default=3)
    tipo_aula = models.CharField(
        max_length=20, choices=TipoAula.choices, default=TipoAula.REGULAR
    )

    class Meta:
        ordering = ["data_hora_inicio"]
        verbose_name = "Aula"
        verbose_name_plural = "Aulas"

    def __str__(self):
        return f"{self.modalidade.nome} em {self.studio.nome} - {self.data_hora_inicio.strftime('%d/%m/%Y %H:%M')}"


class AulaAluno(models.Model):
    """
    Tabela de associação que inscreve um aluno em uma aula e controla a presença.
    """

    class StatusPresenca(models.TextChoices):
        PRESENTE = "PRESENTE", "Presente"
        AUSENTE_COM_REPO = "AUSENTE_COM_REPO", "Ausente com Reposição"
        AUSENTE_SEM_REPO = "AUSENTE_SEM_REPO", "Ausente sem Reposição"
        AGENDADO = "AGENDADO", "Agendado"

    aula = models.ForeignKey(
        Aula, on_delete=models.CASCADE, related_name="alunos_inscritos"
    )
    aluno = models.ForeignKey(
        Aluno, on_delete=models.CASCADE, related_name="aulas_agendadas"
    )
    status_presenca = models.CharField(
        max_length=20, choices=StatusPresenca.choices, default=StatusPresenca.AGENDADO
    )

    #Adicionando o campo credito_utilizado
    credito_utilizado = models.ForeignKey(
        "CreditoAula",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agendamento_uso",
    )

    class Meta:
        unique_together = ("aula", "aluno")
        verbose_name = "Agendamento de Aluno"
        verbose_name_plural = "Agendamentos de Alunos"

    def __str__(self):
        return f"{self.aluno} na aula de {self.aula.modalidade.nome} em {self.aula.data_hora_inicio.strftime('%d/%m')}"


class Reposicao(models.Model):
    """
    Gerencia os créditos de reposição de aulas para os alunos.
    """

    class StatusReposicao(models.TextChoices):
        DISPONIVEL = "DISPONIVEL", "Disponível"
        UTILIZADA = "UTILIZADA", "Utilizada"
        EXPIRADA = "EXPIRADA", "Expirada"

    aluno = models.ForeignKey(
        Aluno, on_delete=models.CASCADE, related_name="reposicoes"
    )
    agendamento_origem = models.ForeignKey(
        AulaAluno, on_delete=models.CASCADE, related_name="reposicao_gerada", null=True
    )
    data_expiracao = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=StatusReposicao.choices,
        default=StatusReposicao.DISPONIVEL,
    )

    def __str__(self):
        return f"Reposição para {self.aluno} (expira em {self.data_expiracao})"


class ListaEspera(models.Model):
    """
    Gerencia a lista de espera para aulas lotadas.
    """

    class StatusEspera(models.TextChoices):
        AGUARDANDO = "AGUARDANDO", "Aguardando"
        NOTIFICADO = "NOTIFICADO", "Notificado"

    aula = models.ForeignKey(
        Aula, on_delete=models.CASCADE, related_name="lista_espera"
    )
    aluno = models.ForeignKey(
        Aluno, on_delete=models.CASCADE, related_name="lista_espera"
    )
    data_inscricao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=StatusEspera.choices, default=StatusEspera.AGUARDANDO
    )

    class Meta:
        unique_together = ("aula", "aluno")
        ordering = ["data_inscricao"]
        verbose_name = "Lista de Espera"
        verbose_name_plural = "Listas de Espera"

    def __str__(self):
        return f"{self.aluno} na lista de espera para {self.aula}"


class CreditoAula(models.Model):
    """
    Gerencia os créditos de reposição de aulas para os alunos.
    """
    class StatusCredito(models.TextChoices):
            DISPONIVEL = "DISPONIVEL", "Disponível"
            UTILIZADA = "UTILIZADA", "Utilizada"
            EXPIRADA = "EXPIRADA", "Expirada"
    
    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        related_name="creditos_aula",  #Nome diferente de "reposicoes"
    )
    agendamento_origem = models.ForeignKey(
        AulaAluno,
        on_delete=models.CASCADE,
        related_name="credito_aula_gerado",  #Nome diferente de "reposicao_gerada"
        null=True,
        blank=True, 
    )
    data_expiracao = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=StatusCredito.choices, # Usando o nome da classe interna
        default=StatusCredito.DISPONIVEL,
    )

    def __str__(self):
        return f"Reposição para {self.aluno} (expira em: {self.data_expiracao})"
