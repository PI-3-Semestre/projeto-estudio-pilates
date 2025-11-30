# notifications/signals.py
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Notification
from financeiro.models import Pagamento, Produto
from usuarios.models import Usuario, Colaborador, Perfil
from agendamentos.models import Aula

def criar_notificacao_para_admins(instance, message, level='INFO'):
    """
    Função auxiliar para criar notificações para todos os admins.
    """
    admin_roles = ['ADMIN_MASTER', 'ADMINISTRADOR']
    admins = Usuario.objects.filter(colaborador__perfis__nome__in=admin_roles).distinct()
    content_type = ContentType.objects.get_for_model(instance)

    for admin in admins:
        Notification.objects.create(
            recipient=admin,
            message=message,
            level=level,
            content_type=content_type,
            object_id=instance.pk
        )

@receiver(post_save, sender=Usuario)
def notificar_novo_usuario(sender, instance, created, **kwargs):
    """
    Cenário 8: Notifica o ADMIN_MASTER quando um novo usuário se cadastra.
    """
    try:
        Perfil.objects.get(nome='ADMIN_MASTER')
    except Perfil.DoesNotExist:
        return 

    if created:
        try:
            
            admin_master_user = Usuario.objects.get(colaborador__perfis__nome='ADMIN_MASTER')
            Notification.objects.create(
                recipient=admin_master_user,
                message=f"Um novo usuário, {instance.get_full_name()}, acabou de se cadastrar no sistema.",
                level=Notification.NotificationLevel.INFO,
                content_object=instance
            )
        except Usuario.DoesNotExist:
            
            pass

@receiver(post_save, sender=Pagamento)
def notificar_pagamento_confirmado(sender, instance, created, **kwargs):
    """
    Cenário 2: Notifica o aluno quando seu pagamento é confirmado.
    """
    if instance.status == 'PAGO' and not created:
        if instance.matricula:
            aluno_usuario = instance.matricula.aluno
            Notification.objects.create(
                recipient=aluno_usuario,
                message=f"Seu pagamento de R$ {instance.valor_total} foi confirmado! Seus créditos para o {instance.matricula.plano.nome} já estão disponíveis.",
                level=Notification.NotificationLevel.SUCCESS,
                content_object=instance
            )

@receiver(post_save, sender=Produto)
def notificar_estoque_baixo(sender, instance, **kwargs):
    """
    Cenário 7: Notifica os admins quando o estoque de um produto está baixo.
    """
    pass 

@receiver(pre_delete, sender=Aula)
def notificar_cancelamento_aula(sender, instance, **kwargs):
    """
    Cenário 5: Notifica os alunos inscritos quando uma aula é cancelada.
    """
    alunos_inscritos = instance.alunos_inscritos.all()
    for inscricao in alunos_inscritos:
        Notification.objects.create(
            recipient=inscricao.aluno.usuario,
            message=f"Aviso: A aula de {instance.modalidade.nome} no dia {instance.data_hora_inicio.strftime('%d/%m às %H:%M')} foi cancelada. Seu crédito de aula foi estornado.",
            level=Notification.NotificationLevel.WARNING,
        )
