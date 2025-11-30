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

    lista_espera_entries = ListaEspera.objects.filter(
        aula=aula,
        status=ListaEspera.StatusEspera.AGUARDANDO
    ).order_by('data_inscricao')[:vagas_disponiveis]

    for entry in lista_espera_entries:
        aluno = entry.aluno

        credito_valido = CreditoAula.objects.filter(
            aluno=aluno,
            data_invalidacao__isnull=True,
            data_validade__gte=aula.data_hora_inicio.date()
        ).order_by('data_validade').first()

        if not credito_valido:
            continue  

        
        if verificar_conflito_horario(aluno, aula):
            continue 

        
        agendamento = AulaAluno.objects.create(
            aula=aula,
            aluno=aluno,
            status_presenca=AulaAluno.StatusPresenca.AGENDADO,
            credito_utilizado=credito_valido
        )

        
        credito_valido.data_invalidacao = agendamento.aula.data_hora_inicio
        credito_valido.save()

        
        entry.delete()

@receiver(post_delete, sender=AulaAluno)
def on_aula_aluno_cancelada(sender, instance, **kwargs):
    """
    Gatilho para quando um agendamento é cancelado (deletado).
    Libera o crédito e processa a lista de espera.
    """
    
    if instance.credito_utilizado:
        credito = instance.credito_utilizado
        credito.data_invalidacao = None
        credito.invalidado_por = None
        credito.save()

    try:
        aula_obj = Aula.objects.get(id=instance.aula_id)
        processar_lista_espera(aula_obj.id)
    except Aula.DoesNotExist:
        pass

@receiver(post_save, sender=Aula)
def on_aula_capacidade_aumentada(sender, instance, created, **kwargs):
    """
    Gatilho para quando a capacidade de uma aula é aumentada.
    """
    if not created:
        try:
            old_instance = Aula.objects.get(pk=instance.pk)
            if instance.capacidade_maxima > old_instance.capacidade_maxima:
                processar_lista_espera(instance.id)
        except Aula.DoesNotExist:
            pass 
