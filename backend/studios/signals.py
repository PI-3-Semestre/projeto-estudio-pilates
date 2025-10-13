# studios/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from guardian.shortcuts import assign_perm, remove_perm
from .models import ColaboradorStudio, Studio

# Dicionário que mapeia os papéis do modelo para as permissões do Meta.
# É a implementação da sua "Matriz de Permissões".
PERMISSIONS_MAP = {
    ColaboradorStudio.PermissaoChoices.ADMIN: [
        "view_dashboard_studio",
        "manage_finances_studio",
        "manage_collaborators_studio",
        "manage_enrollments_studio",
    ],
    ColaboradorStudio.PermissaoChoices.RECEP: [
        "view_dashboard_studio",
        "manage_enrollments_studio",
    ],
    ColaboradorStudio.PermissaoChoices.INSTRUTOR: [
        "view_dashboard_studio",
    ],
    ColaboradorStudio.PermissaoChoices.FISIO: [
        "view_dashboard_studio",
    ]
}

@receiver(post_save, sender=ColaboradorStudio)
def handle_colaborador_studio_permissions(sender, instance, **kwargs):
    """
    Sinal que gerencia as permissões de objeto (per-studio) para um usuário.
    É disparado sempre que um vínculo ColaboradorStudio é salvo.
    """
    # Busca o usuário autenticável a partir da relação no modelo Colaborador.
    usuario_autenticavel = instance.colaborador.usuario
    studio = instance.studio
    papel_atual = instance.permissao

    # 1. Limpa todas as permissões de studio existentes para este usuário.
    # Isso garante que ao mudar um papel (ex: de Instrutor para Admin),
    # as permissões antigas sejam revogadas.
    all_studio_perms = [perm[0] for perm in Studio._meta.permissions]
    for perm_codename in all_studio_perms:
        remove_perm(perm_codename, usuario_autenticavel, studio)

    # 2. Atribui as novas permissões com base no papel atual definido no MAP.
    perms_to_assign = PERMISSIONS_MAP.get(papel_atual, [])
    for perm_codename in perms_to_assign:
        assign_perm(perm_codename, usuario_autenticavel, studio)