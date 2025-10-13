from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class Usuario(AbstractUser):
    """
    Representa um usuário autenticável no sistema, estendendo o modelo padrão do Django.
    """
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="usuario_set",  
        related_query_name="usuario",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="usuario_set",  
        related_query_name="usuario",
    )
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        return self.get_full_name() or self.username

class Unidade(models.Model):
    """
    Representa uma unidade física do estúdio, como São Miguel ou Itaquera.
    """
    nome = models.CharField(max_length=100, unique=True, help_text="Nome da unidade. Ex: São Miguel")
    endereco = models.CharField(max_length=255, blank=True, null=True, help_text="Endereço completo da unidade")

    class Meta:
        db_table = 'unidades'
        verbose_name = "Unidade"
        verbose_name_plural = "Unidades"

    def __str__(self):
        return self.nome

class Colaborador(models.Model):
    """
    Armazena dados profissionais de um funcionário, vinculando-o a um usuário e a um perfil.
    """
    class Perfil(models.TextChoices):
        ADMIN_MASTER = 'ADMIN_MASTER', 'Admin Master'
        ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador'
        RECEPCIONISTA = 'RECEPCIONISTA', 'Recepcionista'
        FISIOTERAPEUTA = 'FISIOTERAPEUTA', 'Fisioterapeuta'
        INSTRUTOR = 'INSTRUTOR', 'Instrutor'

    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    perfil = models.CharField(max_length=20, choices=Perfil.choices)
    registro_profissional = models.CharField(max_length=20, blank=True, null=True, help_text="Ex: CREFITO/CREF")
    unidades = models.ManyToManyField(Unidade, related_name="colaboradores")

    class Meta:
        db_table = 'colaboradores'
        verbose_name = "Colaborador"
        verbose_name_plural = "Colaboradores"

    def __str__(self):
        return self.usuario.get_full_name() or self.usuario.username