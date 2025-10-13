import uuid
from django.db import models
from cpf_field.models import CPFField
from phonenumber_field.modelfields import PhoneNumberField
import secrets

# Create your models here.

#Criação do Token
def generate_token():
    return secrets.token_urlsafe(20)

#Classe Model Aluno
class Aluno(models.Model):   
    nome = models.CharField(max_length=200)
    foto = models.ImageField(upload_to='alunos/', blank=True, null=True)
    dataNascimento = models.DateField(verbose_name="Data de Nascimento")
    cpf = CPFField('cpf')
    email = models.EmailField(unique=True)
    contato = PhoneNumberField(region="BR")
    profissao = models.CharField(max_length=100, blank=True, null=True)

    is_active = models.BooleanField(default=True)

    email_verificado = models.BooleanField(default=False)
    token_verificado = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    token_usuario = models.TextField(default=generate_token)

    def __str__(self):
        return str(self.nome)
