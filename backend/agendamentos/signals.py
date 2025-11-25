# agendamentos/signals.py
from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Aula, AulaAluno, ListaEspera, CreditoAula # Importe Aula
from django.utils import timezone
from datetime import timedelta

def verificar_conflito_horario(aluno, nova_aula):
    """
    Verifica se a nova_aula conflita com alguma aula já agendada pelo aluno.
    """
    inicio_nova_aula = nova_aula.data_hora_inicio
    fim_nova_aula = inicio_nova_aula + timedelta(minutes=nova_aula.duracao_minutos)

    agendamentos_existentes = AulaAluno.objects.filter(
        aluno=aluno,
        status_presenca='AGENDADO'
    ).select_related('aula')

    for agendamento in agendamentos_existentes:
        inicio_existente = agendamento.aula.data_hora_inicio
        fim_existente = inicio_existente + timedelta(minutes=agendamento.aula.duracao_minutos)
        if inicio_nova_aula < fim_existente and fim_nova_aula > inicio_existente:
            return True
    return False

@transaction.atomic
def processar_lista_espera(aula_id):
    """
    Processa a lista de espera para uma aula específica, matriculando alunos se houver vagas.
    """
    try:
        aula = Aula.objects.select_for_update().get(id=aula_id)
    except Aula.DoesNotExist:
        return

    vagas_ocupadas = AulaAluno.objects.filter(aula=aula).count()
    vagas_disponiveis = aula.capacidade_maxima - vagas_ocupadas

    if vagas_disponiveis <= 0:
        return

    # Pega os próximos alunos da lista de espera que ainda estão aguardando
    lista_espera_entries = ListaEspera.objects.filter(
        aula=aula,
        status=ListaEspera.StatusEspera.AGUARDANDO
    ).order_by('data_inscricao')[:vagas_disponiveis]

    for entry in lista_espera_entries:
        aluno = entry.aluno

        # 1. Verificar crédito válido
        credito_valido = CreditoAula.objects.filter(
            aluno=aluno,
            data_invalidacao__isnull=True,
            data_validade__gte=aula.data_hora_inicio.date()
        ).order_by('data_validade').first()

        if not credito_valido:
            continue  # Pula para o próximo da lista se não tiver crédito

        # 2. Verificar conflito de horário
        if verificar_conflito_horario(aluno, aula):
            continue # Pula se houver conflito

        # 3. Se tudo estiver OK, cria o agendamento
        agendamento = AulaAluno.objects.create(
            aula=aula,
            aluno=aluno,
            status_presenca=AulaAluno.StatusPresenca.AGENDADO,
            credito_utilizado=credito_valido
        )

        # 4. Consome o crédito
        credito_valido.data_invalidacao = agendamento.aula.data_hora_inicio
        credito_valido.save()

        # 5. Remove da lista de espera
        entry.delete()

@receiver(post_delete, sender=AulaAluno)
def on_aula_aluno_cancelada(sender, instance, **kwargs):
    """
    Gatilho para quando um agendamento é cancelado (deletado).
    Libera o crédito e processa a lista de espera.
    """
    # Libera o crédito utilizado no agendamento cancelado
    if instance.credito_utilizado:
        credito = instance.credito_utilizado
        credito.data_invalidacao = None
        credito.invalidado_por = None
        credito.save()

    # Processa a lista de espera da aula que teve o agendamento cancelado
    # Acessa o ID da aula diretamente e tenta buscar o objeto Aula
    # para evitar o erro DoesNotExist se a Aula já foi deletada.
    try:
        # Tenta obter a Aula usando o ID armazenado na instância de AulaAluno
        # Se a Aula já foi deletada, esta linha levantará DoesNotExist
        aula_obj = Aula.objects.get(id=instance.aula_id)
        processar_lista_espera(aula_obj.id)
    except Aula.DoesNotExist:
        # Se a Aula não existe mais (ex: foi deletada em cascata),
        # não há lista de espera para processar para uma aula inexistente.
        pass

@receiver(post_save, sender=Aula)
def on_aula_capacidade_aumentada(sender, instance, created, **kwargs):
    """
    Gatilho para quando a capacidade de uma aula é aumentada.
    """
    if not created:
        try:
            # Pega a versão anterior do objeto no banco de dados
            old_instance = Aula.objects.get(pk=instance.pk)
            if instance.capacidade_maxima > old_instance.capacidade_maxima:
                processar_lista_espera(instance.id)
        except Aula.DoesNotExist:
            pass # Objeto está sendo criado, não há versão antiga para comparar
