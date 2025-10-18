from django.db import models
from cpf_field.models import CPFField
from phonenumber_field.modelfields import PhoneNumberField
from usuarios.models import Usuario

class Aluno(models.Model):   
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    foto = models.ImageField(upload_to='alunos/', blank=True, null=True)
    dataNascimento = models.DateField(verbose_name="Data de Nascimento")
    cpf = CPFField(unique=True)
    contato = PhoneNumberField(region="BR")
    profissao = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    unidades = models.ManyToManyField('studios.Studio', related_name="alunos")

    class Meta:
        db_table = 'alunos'
        verbose_name = "Aluno"
        verbose_name_plural = "Alunos"

    def __str__(self):
        return str(self.usuario.get_full_name())
