from django.db import models
from django.contrib.auth.models import AbstractUser
from cpf_field.models import CPFField
from phonenumber_field.modelfields import PhoneNumberField

class Cargo(models.Model):
    """
    Modelo para representar os cargos dos colaboradores.
    Ex: Fisioterapeuta, Recepcionista, Gerente.
    """
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome

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

class Colaborador(AbstractUser):
    """
    Modelo de usuário customizado para os colaboradores do estúdio.
    Herda de AbstractUser para aproveitar o sistema de autenticação do Django.
    """
    class Status(models.TextChoices):
        ATIVO = 'ATIVO', 'Ativo'
        INATIVO = 'INATIVO', 'Inativo'
        FERIAS = 'FERIAS', 'Férias'

    first_name = None
    last_name = None

    nome = models.CharField(max_length=255)
    cpf = CPFField(unique=True)
    data_nascimento = models.DateField()
    telefone = PhoneNumberField(region="BR")
    email = models.EmailField(unique=True)
    data_admissao = models.DateField()
    data_demissao = models.DateField(null=True, blank=True)
    salario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ATIVO)

    cargo = models.ForeignKey(Cargo, on_delete=models.PROTECT, related_name='colaboradores')
    endereco = models.OneToOneField(Endereco, on_delete=models.SET_NULL, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nome', 'cpf']

    def __str__(self):
        return self.nome