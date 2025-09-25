from django.db import models

# Create your models here.

#Classe Model Aluno
class Aluno(models.Model):   
    nome = models.CharField(max_length=200)
    foto = models.ImageField(upload_to='alunos/', blank=True, null=True)
    dataNascimento = models.DateField(verbose_name="Data de Nascimento")
    cpf = models.CharField(max_length=14, unique=True)
    email = models.EmailField(unique=True)
    contato = models.CharField(max_length=20)
    profissao = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return str(self.nome)
