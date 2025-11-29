from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from agendamentos.models import CreditoAula
from alunos.models import Aluno

from .models import Matricula, Pagamento


@receiver(post_save, sender=Matricula)
def gerar_pagamento_matricula(sender, instance, created, **kwargs):
    """
    Gera um Pagamento automaticamente quando uma nova Matrícula é criada.
    """
    if created:
        plano = instance.plano
        # A data de vencimento será 10 dias após a criação da matrícula
        data_vencimento = timezone.now().date() + timezone.timedelta(days=10)

        Pagamento.objects.create(
            matricula=instance,
            valor_total=plano.preco,
            data_vencimento=data_vencimento,
            status="PENDENTE",
        )


@receiver(post_save, sender=Pagamento)
def gerar_creditos_aula(sender, instance, created, **kwargs):
    """
    Gera os Créditos de Aula para o aluno quando um pagamento de
    matrícula é confirmado (status='PAGO').

    Verifica se os créditos já foram gerados para essa matrícula para
    evitar duplicidade.
    """
    # Condição 1: O status do pagamento deve ser 'PAGO'
    # Condição 2: O pagamento deve estar associado a uma matrícula
    if instance.status == 'PAGO' and instance.matricula:
        matricula = instance.matricula

        # CORREÇÃO DE BUG: 
        # 'matricula.aluno' é o 'Usuario'.
        # 'matricula.aluno.aluno' é o perfil 'Aluno' que o CreditoAula espera.
        # (Assumindo que sua FK no modelo Aluno se chama 'aluno')
        try:
            aluno_perfil = matricula.aluno.aluno
        except AttributeError:
            # Caso de segurança se o perfil do aluno não for encontrado
            return

        if not CreditoAula.objects.filter(matricula_origem=matricula).exists():
            
            plano = matricula.plano
            
            # Cálculo dos créditos
            semanas = (plano.duracao_dias / 7)
            total_creditos = int(semanas * plano.creditos_semanais)
            data_validade = matricula.data_fim

            # 3. ALTERADO: Adicionado 'matricula_origem' e corrigido 'aluno'
            CreditoAula.objects.create(
                aluno=aluno_perfil,           # Passa o perfil Aluno
                quantidade=total_creditos,
                data_validade=data_validade,
                matricula_origem=matricula 
            )