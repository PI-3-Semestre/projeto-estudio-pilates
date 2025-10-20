from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from cpf_field.models import CPFField
from phonenumber_field.modelfields import PhoneNumberField
from studios.models import Studio

class Perfil(models.Model):
    """
    Define os papéis ou funções que um colaborador pode ter no sistema.
    Estes perfis são usados para controlar as permissões de acesso.
    """
    NOME_CHOICES = [
        ('ADMIN_MASTER', 'Admin Master'), # Super administrador com acesso total
        ('ADMINISTRADOR', 'Administrador'), # Administrador de um studio
        ('RECEPCIONISTA', 'Recepcionista'),
        ('FISIOTERAPEUTA', 'Fisioterapeuta'),
        ('INSTRUTOR', 'Instrutor'), # Instrutor de Pilates
    ]
    # O nome do perfil é único para evitar duplicidade.
    nome = models.CharField(max_length=20, choices=NOME_CHOICES, unique=True)

    def __str__(self):
        """Retorna o nome legível do perfil. Ex: 'Admin Master'."""
        return self.get_nome_display()

class Usuario(AbstractUser):
    """
    Modelo customizado de usuário que estende o `AbstractUser` do Django.
    É a base para a autenticação e identificação no sistema.
    """
    # CPF como um identificador único para o usuário, além do username.
    cpf = CPFField(unique=True, null=True, blank=True, help_text="CPF do usuário. Será usado como identificador único.")
    
    # Campos de relacionamento com os modelos de Group e Permission do Django.
    # Os `related_name` foram ajustados para evitar conflitos com o modelo de usuário padrão.
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
        """Retorna o nome completo do usuário ou seu username se o nome não estiver definido."""
        return self.get_full_name() or self.username

class Endereco(models.Model):
    """
    Modelo para armazenar dados de endereço, reutilizável por outros modelos.
    """
    logradouro = models.CharField(max_length=255)
    numero = models.CharField(max_length=20)
    complemento = models.CharField(max_length=100, blank=True, null=True)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2, help_text="Sigla do estado, ex: SP")
    cep = models.CharField(max_length=9, help_text="CEP no formato XXXXX-XXX") 

    def __str__(self):
        return f"{self.logradouro}, {self.numero} - {self.cidade}/{self.estado}"

class Colaborador(models.Model):
    """
    Modelo que representa o perfil profissional de um usuário.
    Contém informações de trabalho, como perfis de acesso, status e unidades.
    """
    class Status(models.TextChoices):
        ATIVO = 'ATIVO', 'Ativo'
        INATIVO = 'INATIVO', 'Inativo'
        FERIAS = 'FERIAS', 'Férias'

    # Relação um-para-um com o usuário. Cada usuário pode ter apenas um perfil de colaborador.
    # `primary_key=True` faz deste campo a chave primária da tabela.
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    
    # Perfis de acesso associados a este colaborador.
    perfis = models.ManyToManyField(Perfil, related_name="colaboradores")
    
    registro_profissional = models.CharField(max_length=20, blank=True, null=True, help_text="Ex: CREFITO para fisioterapeutas, CREF para instrutores")
    data_nascimento = models.DateField(null=True, blank=True)
    telefone = PhoneNumberField(region="BR", null=True, blank=True)
    data_admissao = models.DateField(null=True, blank=True)
    data_demissao = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ATIVO)
    
    # Endereço do colaborador. Se o endereço for deletado, o campo fica nulo.
    endereco = models.OneToOneField(Endereco, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Novo campo de unidades que usa a tabela intermediária para permissões granulares.
    unidades = models.ManyToManyField(
        Studio,
        through='studios.ColaboradorStudio',
        related_name="colaboradores"
    )

    class Meta:
        db_table = 'colaboradores'
        verbose_name = "Colaborador"
        verbose_name_plural = "Colaboradores"

    def __str__(self):
        """Retorna o nome do usuário associado a este perfil de colaborador."""
        return self.usuario.get_full_name() or self.usuario.username