from django.db import models
from cpf_field.models import CPFField
from phonenumber_field.modelfields import PhoneNumberField
# Create your models here.

#Classe Model Aluno
class Aluno(models.Model):   
    nome = models.CharField(max_length=200)
    foto = models.ImageField(upload_to='alunos/', blank=True, null=True)
    dataNascimento = models.DateField(verbose_name="Data de Nascimento")
    cpf = CPFField()
    email = models.EmailField(unique=True)
    contato = PhoneNumberField(region="BR")
    profissao = models.CharField(max_length=100, blank=True, null=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.nome)
