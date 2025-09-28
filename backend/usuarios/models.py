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
    cpf = CPFField()
    email = models.EmailField(unique=True)
    contato = PhoneNumberField(region="BR")
    profissao = models.CharField(max_length=100, blank=True, null=True)

    is_active = models.BooleanField(default=True)

    email_verificado = models.BooleanField(default=False)
    token_verificado = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    token_usuario = models.TextField(default=generate_token)

    def __str__(self):
        return str(self.nome)


class AvaliacaoInicial(models.Model):
    # Criando a relação um para um com o aluno e avalicao
    #on_delete=models.CASCADE significa que se um aluno for deletado, todas as suas avaliações também serão.
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="avalicoes")
    
    data_avaliacao = models.DateField(verbose_name = "Data de Avaliação")
    diagnostico_fisioterapeutico = models.TextField(verbose_name="Diagnóstico Fisioterapeutico", blank=True, null=True)
    historico_medico = models.TextField(verbose_name="Histórico Médico", blank=True, null=True)
    patologias = models.TextField(verbose_name="Patologias", blank=True, null=True)
    exames_complementares = models.TextField(verbose_name="Exames Complementares", blank=True, null=True)
    medicamentos_em_uso = models.TextField("Medicamentos em Uso", blank=True, null=True)
    tratamentos_realizados = models.TextField(verbose_name="Tratamentos Anteriores", blank=True, null=True)
    objetivo_aluno = models.TextField("Objetivo do Aluno")
    foto_avaliacao_postural = models.ImageField(upload_to='avaliacoes/', verbose_name="Foto da Avalização Postural", null=True, blank=True)
    data_reavalicao = models.DateField(verbose_name="Data para Reavaliação", blank=True, null=True)
    
    def __str__(self):
        # Isso ajuda a identificar a avaliação no painel de admin do Django
        return f"Avaliação de {self.aluno.nome} em {self.data_avaliacao.strftime('%d/%m/%Y')}"