from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission, BaseUserManager
from cpf_field.models import CPFField
from phonenumber_field.modelfields import PhoneNumberField
from studios.models import Studio

class UsuarioManager(BaseUserManager):
    """Define um gerenciador customizado para o modelo Usuario."""

    def create_user(self, username, email, password=None, **extra_fields):
        """Cria e salva um usuário com o nome de usuário, e-mail e senha fornecidos."""
        if not username:
            raise ValueError('O campo de nome de usuário deve ser definido')
        if not email:
            raise ValueError('O campo de e-mail deve ser definido')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Cria e salva um superusuário com o nome de usuário, e-mail e senha fornecidos."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('O superusuário deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('O superusuário deve ter is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

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
    O login é feito via username e senha.
    """
    email = models.EmailField('endereço de e-mail', unique=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UsuarioManager()

    # CPF como um identificador único para o usuário.
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

class ColaboradorManager(models.Manager):
    """Manager para retornar apenas colaboradores ativos."""
    def get_queryset(self):
        return super().get_queryset().filter(status=Colaborador.Status.ATIVO)

from django.utils import timezone

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
    
    registro_profissional = models.CharField(max_length=50, blank=True, null=True, help_text="Ex: CREFITO para fisioterapeutas, CREF para instrutores")
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

    # Managers do modelo
    objects = ColaboradorManager()  # O manager padrão que retorna apenas ativos.
    todos_objetos = models.Manager()  # Manager para acessar todos os objetos.

    class Meta:
        db_table = 'colaboradores'
        verbose_name = "Colaborador"
        verbose_name_plural = "Colaboradores"

    def __str__(self):
        """Retorna o nome do usuário associado a este perfil de colaborador. """
        return self.usuario.get_full_name() or self.usuario.email

    def delete(self, using=None, keep_parents=False):
        """
        Sobrescreve o método de exclusão para implementar a "exclusão suave" (soft delete).
        Marca o colaborador como inativo e desativa o usuário associado.
        """
        self.status = self.Status.INATIVO
        self.data_demissao = timezone.now().date()
        self.save()

        # Desativa o usuário associado para que ele não possa mais fazer login.
        self.usuario.is_active = False
        self.usuario.save()