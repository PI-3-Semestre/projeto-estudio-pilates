# studios/models.py
from django.db import models

class Studio(models.Model):
    """ 
    Representa uma unidade física do estúdio.
    É a entidade central em torno da qual colaboradores e alunos são organizados.
    """
    nome = models.CharField(max_length=100, unique=True)
    endereco = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps automáticos
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_ultima_modificacao = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']
        verbose_name = "Studio (Unidade)"
        verbose_name_plural = "Studios (Unidades)"
        
        # Permissões customizadas a nível de objeto (usadas por libs como django-guardian).
        # Permitem dar a um usuário permissões específicas para uma instância particular de Studio.
        # Ex: User A pode gerenciar finanças do Studio X, mas não do Studio Y.
        permissions = [
            ("view_dashboard_studio", "Pode visualizar o dashboard do studio"),
            ("manage_finances_studio", "Pode gerenciar as finanças do studio"),
            ("manage_collaborators_studio", "Pode gerenciar os colaboradores do studio"),
            ("manage_enrollments_studio", "Pode gerenciar matrículas e vendas no studio"),
        ]

    def __str__(self):
        return self.nome

class ColaboradorStudio(models.Model):
    """
    Tabela de associação (pivot) que define o papel (permissão) de um colaborador
    em um studio específico. Esta é a base do sistema de permissões granulares.
    
    NOTA ARQUITETURAL: A lógica de negócio atual (ex: em StudioController) parece usar
    a relação ManyToMany direta `Colaborador.unidades` em vez deste modelo.
    Este modelo `ColaboradorStudio` permite uma granularidade maior (papel por studio)
    e deveria ser considerado na evolução da lógica de permissões.
    """
    class PermissaoChoices(models.TextChoices):
        ADMIN = 'Admin', 'Administrador'
        INSTRUTOR = 'Instrutor', 'Instrutor'
        FISIO = 'Fisio', 'Fisioterapeuta'
        RECEP = 'Recep', 'Recepcionista'

    # Conecta-se ao modelo Colaborador do app 'usuarios'.
    colaborador = models.ForeignKey(
        'usuarios.Colaborador',
        on_delete=models.CASCADE,
        related_name='vinculos_studio'
    )
    # Conecta-se ao Studio.
    studio = models.ForeignKey(
        Studio,
        on_delete=models.CASCADE,
        related_name='colaboradores_vinculados'
    )
    # Define o papel específico do colaborador nesta unidade.
    permissao = models.CharField(
        max_length=10,
        choices=PermissaoChoices.choices,
        help_text="Define o papel do colaborador nesta unidade específica."
    )

    class Meta:
        # Garante que um colaborador tenha apenas um papel por studio.
        unique_together = ('colaborador', 'studio')
        verbose_name = "Vínculo Colaborador-Studio"
        verbose_name_plural = "Vínculos Colaborador-Studio"

    def __str__(self):
        return f"{self.colaborador.usuario.get_full_name()} em {self.studio.nome}: {self.get_permissao_display()}"
