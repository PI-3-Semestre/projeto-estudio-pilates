from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from cpf_field.models import CPFField
from phonenumber_field.modelfields import PhoneNumberField
from studios.models import Studio

class Perfil(models.Model):
    NOME_CHOICES = [
        ('ADMIN_MASTER', 'Admin Master'),
        ('ADMINISTRADOR', 'Administrador'),
        ('RECEPCIONISTA', 'Recepcionista'),
        ('FISIOTERAPEUTA', 'Fisioterapeuta'),
        ('INSTRUTOR', 'Instrutor'),
    ]
    nome = models.CharField(max_length=20, choices=NOME_CHOICES, unique=True)

    def __str__(self):
        return self.get_nome_display()

class Usuario(AbstractUser):
    """
    Representa um usuário autenticável no sistema, estendendo o modelo padrão do Django.
    """
    cpf = CPFField(unique=True, null=True, blank=True, help_text="CPF do usuário. Será usado como identificador único.")
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

class Endereco(models.Model):
    """
    Modelo para armazenar os endereços dos colaboradores.
    """
    logradouro = models.CharField(max_length=255)
    numero = models.CharField(max_length=20)
    complemento = models.CharField(max_length=100, blank=True, null=True)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    cep = models.CharField(max_length=9) 

    def __str__(self):
        return f"{self.logradouro}, {self.numero} - {self.cidade}/{self.estado}"

class Colaborador(models.Model):
    """
    Armazena dados profissionais de um funcionário, vinculando-o a um usuário e a um perfil.
    """
    class Status(models.TextChoices):
        ATIVO = 'ATIVO', 'Ativo'
        INATIVO = 'INATIVO', 'Inativo'
        FERIAS = 'FERIAS', 'Férias'

    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    perfis = models.ManyToManyField(Perfil, related_name="colaboradores")
    registro_profissional = models.CharField(max_length=20, blank=True, null=True, help_text="Ex: CREFITO/CREF")
    data_nascimento = models.DateField(null=True, blank=True)
    telefone = PhoneNumberField(region="BR", null=True, blank=True)
    data_admissao = models.DateField(null=True, blank=True)
    data_demissao = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ATIVO)
    endereco = models.OneToOneField(Endereco, on_delete=models.SET_NULL, null=True, blank=True)
    unidades = models.ManyToManyField(Studio, related_name="colaboradores")

    class Meta:
        db_table = 'colaboradores'
        verbose_name = "Colaborador"
        verbose_name_plural = "Colaboradores"

    def __str__(self):
        return self.usuario.get_full_name() or self.usuario.username