from django.db import models
from alunos.models import Aluno

class Plano(models.Model):
    """ Define um pacote de serviço vendável (plano de aulas). """
    nome = models.CharField(max_length=100, unique=True)
    duracao_dias = models.IntegerField(default=30)
    creditos_semanais = models.IntegerField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_ultima_modificacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'planos'
        verbose_name = "Plano"
        verbose_name_plural = "Planos"
    def __str__(self):
        return self.nome

class Matricula(models.Model):
    """ Representa a matrícula de um aluno em um plano específico. """
    class Status(models.TextChoices):
        ATIVA = 'ATIVA', 'Ativa'
        CANCELADA = 'CANCELADA', 'Cancelada'
        CONCLUIDA = 'CONCLUIDA', 'Concluída'

    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="matriculas")
    plano = models.ForeignKey(Plano, on_delete=models.PROTECT, related_name="matriculas")
    data_inicio = models.DateField()
    data_fim = models.DateField()
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ATIVA)
    
    class Meta:
        db_table = 'matriculas'
        verbose_name = "Matrícula"
        verbose_name_plural = "Matrículas"
    def __str__(self):
        return f"{self.aluno} - {self.plano}"

class Produto(models.Model):
    """ Representa um produto físico para venda no estúdio. """
    nome = models.CharField(max_length=100)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'produtos'
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
    def __str__(self):
        return self.nome

class Venda(models.Model):
    """ Registra uma venda (geralmente de produtos) para um aluno. """
    aluno = models.ForeignKey(Aluno, on_delete=models.SET_NULL, null=True, related_name="vendas")
    data_venda = models.DateTimeField(auto_now_add=True)
    produtos = models.ManyToManyField(Produto, through='VendaProduto')
    
    class Meta:
        db_table = 'vendas'
        verbose_name = "Venda"
        verbose_name_plural = "Vendas"

class VendaProduto(models.Model):
    """ Tabela de ligação para registrar produtos em uma venda. """
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT)
    quantidade = models.PositiveIntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'venda_produtos'
        unique_together = [['venda', 'produto']]

class Pagamento(models.Model):
    """ Centraliza um pagamento, que pode ser de uma matrícula ou venda. """
    class Status(models.TextChoices):
        PENDENTE = 'PENDENTE', 'Pendente'
        PAGO = 'PAGO', 'Pago'
        ATRASADO = 'ATRASADO', 'Atrasado'
        
    matricula = models.ForeignKey(Matricula, on_delete=models.CASCADE, null=True, blank=True)
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, null=True, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pagamento = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE)
    data_vencimento = models.DateField()
    data_pagamento = models.DateTimeField(null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_ultima_modificacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pagamentos'
        verbose_name = "Pagamento"
        verbose_name_plural = "Pagamentos"

class Parcela(models.Model):
    """ Representa uma parcela de um pagamento. """
    pagamento = models.ForeignKey(Pagamento, on_delete=models.CASCADE, related_name="parcelas")
    numero_parcela = models.IntegerField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()
    status = models.CharField(max_length=20) # Ex: PAGA, PENDENTE
    
    class Meta:
        db_table = 'parcelas'
        unique_together = [['pagamento', 'numero_parcela']]