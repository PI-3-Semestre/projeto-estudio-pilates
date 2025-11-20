# notifications/models.py
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Notification(models.Model):
    class NotificationLevel(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Sucesso'
        INFO = 'INFO', 'Informação'
        WARNING = 'WARNING', 'Aviso'
        ERROR = 'ERROR', 'Erro'

    # Para quem é a notificação
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    # Mensagem da notificação
    message = models.TextField()

    # Status de leitura
    is_read = models.BooleanField(default=False)

    # Nível para estilização no front-end (ex: cor do ícone)
    level = models.CharField(
        max_length=10,
        choices=NotificationLevel.choices,
        default=NotificationLevel.INFO
    )

    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Campos para Link Genérico ---
    # Permite que a notificação aponte para QUALQUER outro objeto no sistema
    # Ex: um Pagamento, uma Aula, um Aluno, etc.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'

    def __str__(self):
        return f"Notificação para {self.recipient.get_full_name()}: {self.message[:30]}..."
