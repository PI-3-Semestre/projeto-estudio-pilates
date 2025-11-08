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
    if (
        instance.status == "PAGO"
        and hasattr(instance, "matricula")
        and instance.matricula
    ):
        matricula = instance.matricula
        plano = matricula.plano
        aluno_usuario = matricula.aluno

        # FIX 1: Obter a instância de Aluno a partir do Usuário da matrícula
        try:
            aluno_instancia = Aluno.objects.get(usuario=aluno_usuario)
        except Aluno.DoesNotExist:
            # Se não houver perfil de aluno, não é possível criar créditos.
            # Idealmente, logar um erro aqui.
            return

        # Condição 3: Verificar se créditos já não foram criados para esta matrícula
        # FIX 2: Usar 'data_adicao' em vez de 'data_criacao'
        creditos_existem = CreditoAula.objects.filter(
            aluno=aluno_instancia, data_adicao__gte=matricula.data_inicio
        ).exists()

        if not creditos_existem:
            # Cálculo do total de créditos a serem gerados
            if plano.duracao_dias > 0 and plano.creditos_semanais > 0:
                total_creditos = (plano.duracao_dias // 7) * plano.creditos_semanais

                # FIX 3: Adicionar o campo obrigatório 'data_validade'
                data_validade = matricula.data_fim

                # Gera os objetos CreditoAula
                creditos_a_criar = [
                    CreditoAula(aluno=aluno_instancia, data_validade=data_validade)
                    for _ in range(total_creditos)
                ]
                CreditoAula.objects.bulk_create(creditos_a_criar)
