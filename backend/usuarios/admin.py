from django.contrib import admin

# Register your models here.

from .models import Aluno, AvaliacaoInicial

# Register your models here.

# Registra o model Aluno no admin
admin.site.register(Aluno)

# Registra o model AvaliacaoInicial no admin
admin.site.register(AvaliacaoInicial)

#Foi usado admin.site.register() para cada modelo, tornando-os visíveis e gerenciáveis através da interface de administração do Django.