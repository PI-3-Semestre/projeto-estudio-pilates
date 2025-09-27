# backend/usuarios/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    """
    Modelo de usuário customizado que substitui o padrão do Django.
    Agora ele entende o que é um CPF.
    """
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)

    # Estes campos são adicionados para evitar um erro comum de 'related_name'
    # quando se customiza o usuário.
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name="usuario_set",
        related_query_name="usuario",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name="usuario_set",
        related_query_name="usuario",
    )

    def __str__(self):
        return self.email