# backend/usuarios/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    class TipoUsuario(models.TextChoices):
        ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador'
        RECEPCIONISTA = 'RECEPCIONISTA', 'Recepcionista'
        INSTRUTOR = 'INSTRUTOR', 'Instrutor'
        ALUNO = 'ALUNO', 'Aluno'

    tipo = models.CharField(
        max_length=15,
        choices=TipoUsuario.choices,
        default=TipoUsuario.ALUNO,
    )
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)

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