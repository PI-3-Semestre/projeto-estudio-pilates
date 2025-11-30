from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Colaborador, Perfil

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Configuração do admin para o modelo Usuario.
    Herda de UserAdmin para manter a funcionalidade padrão de gerenciamento de usuários do Django.
    """
    model = Usuario
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']

@admin.register(Colaborador)
class ColaboradorAdmin(admin.ModelAdmin):
    """
    Configuração do admin para o modelo Colaborador.
    """
    actions = ['inativar_colaboradores']

    list_display = ('get_full_name', 'get_email', 'status', 'get_user_is_active')
    list_filter = ('status', 'perfis')
    search_fields = ('usuario__username', 'usuario__first_name', 'usuario__last_name', 'usuario__email')

    def get_queryset(self, request):
        """
        Sobrescreve o queryset padrão para usar o manager que retorna todos os objetos,
        incluindo os inativos.
        """
        return Colaborador.todos_objetos.all()

    def get_full_name(self, obj):
        return obj.usuario.get_full_name() or obj.usuario.username
    get_full_name.short_description = 'Nome Completo'

    def get_email(self, obj):
        return obj.usuario.email
    get_email.short_description = 'Email'

    def get_user_is_active(self, obj):
        return obj.usuario.is_active
    get_user_is_active.short_description = 'Usuário Ativo?'
    get_user_is_active.boolean = True # Exibe como um ícone (sim/não).

    @admin.action(description='Inativar colaboradores selecionados')
    def inativar_colaboradores(self, request, queryset):
        """
        Ação do admin que chama o método delete() (soft delete) para cada
        colaborador selecionado.
        """
        for colaborador in queryset:
            colaborador.delete() # Chama o nosso método delete() sobrescrito.
        self.message_user(request, f'{queryset.count()} colaborador(es) foram inativados com sucesso.')

admin.site.register(Perfil)
