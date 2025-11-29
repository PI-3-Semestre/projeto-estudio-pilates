from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from usuarios.models import Usuario

class Aluno(models.Model):   
    """
    Modelo que representa o perfil de um Aluno.
    Este modelo estende o modelo de Usuário com informações específicas do aluno.
    """
    # Relação um-para-um com o usuário. Cada usuário pode ter apenas um perfil de aluno.
    # `primary_key=True` faz deste campo a chave primária da tabela.
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)

    # Foto de perfil do aluno.
    foto = models.ImageField(upload_to='fotos_alunos/', blank=True, null=True)

    dataNascimento = models.DateField(verbose_name="Data de Nascimento")
    contato = PhoneNumberField(region="BR", verbose_name="Telefone de Contato")
    profissao = models.CharField(max_length=100, blank=True, null=True)

    # Campo para desativar o perfil de um aluno sem excluí-lo.
    is_active = models.BooleanField(default=True, verbose_name="Ativo")

    # Unidades/Studios que o aluno frequenta.
    unidades = models.ManyToManyField('studios.Studio', related_name="alunos")

    # O campo CPF foi removido deste modelo para evitar redundância.
    # O CPF canônico é armazenado no modelo `Usuario` e pode ser acessado via `self.usuario.cpf`.

    class Meta:
        db_table = 'alunos'
        verbose_name = "Aluno"
        verbose_name_plural = "Alunos"

    def __str__(self):
        """Retorna o nome completo do usuário associado a este perfil de aluno."""
        return str(self.usuario.get_full_name())

    @property
    def cpf(self):
        """Propriedade para acessar o CPF do usuário relacionado diretamente."""
        return self.usuario.cpf