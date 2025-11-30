from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from usuarios.models import Usuario

class Aluno(models.Model):   
    """
    Modelo que representa o perfil de um Aluno.
    Este modelo estende o modelo de Usuário com informações específicas do aluno.
    """
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)

    foto = models.ImageField(upload_to='fotos_alunos/', blank=True, null=True)

    dataNascimento = models.DateField(verbose_name="Data de Nascimento")
    contato = PhoneNumberField(region="BR", verbose_name="Telefone de Contato")
    profissao = models.CharField(max_length=100, blank=True, null=True)

    is_active = models.BooleanField(default=True, verbose_name="Ativo")

    unidades = models.ManyToManyField('studios.Studio', related_name="alunos")


    class Meta:
        db_table = 'alunos'
        verbose_name = "Aluno"
        verbose_name_plural = "Alunos"

    def __str__(self):
        return str(self.usuario.get_full_name())

    @property
    def cpf(self):
        return self.usuario.cpf