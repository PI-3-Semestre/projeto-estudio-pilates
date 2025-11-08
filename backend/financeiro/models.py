from django.db import models
from django.conf import settings


class Plano(models.Model):
    nome = models.CharField(max_length=100)
    duracao_dias = models.IntegerField()
    creditos_semanais = models.IntegerField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.nome


class Produto(models.Model):
    nome = models.CharField(max_length=100)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.IntegerField()

    def __str__(self):
        return self.nome


class Matricula(models.Model):
    aluno = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plano = models.ForeignKey(Plano, on_delete=models.CASCADE)
    data_inicio = models.DateField()
    data_fim = models.DateField()

    def __str__(self):
        return f"{self.aluno} - {self.plano}"


class Venda(models.Model):
    aluno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    data_venda = models.DateField(auto_now_add=True)
    produtos = models.ManyToManyField(Produto, through="VendaProduto")

    def __str__(self):
        return f"Venda {self.id} - {self.aluno}"


class VendaProduto(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.IntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.venda} - {self.produto}"


class Pagamento(models.Model):
    STATUS_CHOICES = [
        ("PENDENTE", "Pendente"),
        ("PAGO", "Pago"),
        ("ATRASADO", "Atrasado"),
        ("CANCELADO", "Cancelado"),
    ]
    matricula = models.ForeignKey(
        Matricula, on_delete=models.CASCADE, null=True, blank=True
    )
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, null=True, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDENTE")
    data_vencimento = models.DateField()
    data_pagamento = models.DateField(null=True, blank=True)
    metodo_pagamento = models.CharField(max_length=50, null=True, blank=True)
    comprovante_pagamento = models.FileField(
        upload_to="comprovantes_pagamento/", null=True, blank=True
    )

    def __str__(self):
        return f"Pagamento {self.id} - {self.status}"


class Parcela(models.Model):
    pagamento = models.ForeignKey(
        Pagamento, on_delete=models.CASCADE, related_name="parcelas"
    )
    numero_parcela = models.IntegerField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()
    status = models.CharField(
        max_length=10, choices=Pagamento.STATUS_CHOICES, default="PENDENTE"
    )

    def __str__(self):
        return f"Parcela {self.numero_parcela} do Pagamento {self.pagamento.id}"
