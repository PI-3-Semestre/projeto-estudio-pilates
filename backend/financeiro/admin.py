from django.contrib import admin
from .models import Plano, Produto, Matricula, Venda, VendaProduto, Pagamento, Parcela

admin.site.register(Plano)
admin.site.register(Produto)
admin.site.register(Matricula)
admin.site.register(Venda)
admin.site.register(VendaProduto)
admin.site.register(Pagamento)
admin.site.register(Parcela)
