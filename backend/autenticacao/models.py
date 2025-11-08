# autenticacao/models.py
import secrets
from django.db import models
from django.utils import timezone
from datetime import timedelta
from usuarios.models import Usuario

class PasswordResetToken(models.Model):
    """
    Modelo para armazenar tokens de redefinição de senha.
    """
    user = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name="reset_tokens",
        verbose_name="Usuário"
    )
    token = models.CharField(
        max_length=255, 
        unique=True,
        verbose_name="Token"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Data de Criação"
    )
    expires_at = models.DateTimeField(
        verbose_name="Data de Expiração"
    )

    def save(self, *args, **kwargs):
        """
        Ao salvar um novo token, gera um valor seguro e define a data de expiração.
        """
        if not self.pk:
            self.token = secrets.token_urlsafe(48)  # Gera um token seguro de 64 bytes
            self.expires_at = timezone.now() + timedelta(minutes=15) # Token expira em 15 minutos
        super().save(*args, **kwargs)

    def is_expired(self):
        """
        Verifica se o token já expirou.
        """
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Token de redefinição para {self.user.get_full_name() or self.user.username}"

    class Meta:
        verbose_name = "Token de Redefinição de Senha"
        verbose_name_plural = "Tokens de Redefinição de Senha"
