from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario # CUIDADO: Verifique se o nome do seu modelo é 'Usuario'

class UserAdmin(BaseUserAdmin):
    # Adiciona o campo 'email' ao formulário de criação
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {'fields': ('email',)}),
    )

# Registra o seu modelo de Usuario com o admin customizado
admin.site.register(Usuario, UserAdmin)