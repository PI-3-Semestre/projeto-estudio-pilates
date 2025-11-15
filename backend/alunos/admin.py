from django.contrib import admin
from .models import Aluno

# Isso registra o modelo Aluno na página de admin
admin.site.register(Aluno)