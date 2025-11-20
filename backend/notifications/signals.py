# notifications/signals.py
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Notification
from financeiro.models import Pagamento, Produto
from usuarios.models import Usuario
from agendamentos.models import Aula, AulaAluno, ListaEspera

# Exemplo de como um sinal seria implementado (a lógica completa virá depois)

@receiver(post_save, sender=Usuario)
def notificar_novo_usuario(sender, instance, created, **kwargs):
    if created:
        # Lógica para encontrar o ADMIN_MASTER e criar a notificação
        pass
