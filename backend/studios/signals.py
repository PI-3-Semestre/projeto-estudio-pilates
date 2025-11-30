# studios/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from guardian.shortcuts import assign_perm, remove_perm
from .models import ColaboradorStudio, Studio

PERMISSIONS_MAP = {
    # Administradores têm todas as permissões no studio.
    'Admin': [
        "view_dashboard_studio",
        "manage_finances_studio",
        "manage_collaborators_studio",
        "manage_enrollments_studio",
    ],
    # Recepcionistas podem ver o dashboard e gerenciar matrículas.
    'Recep': [
        "view_dashboard_studio",
        "manage_enrollments_studio",
    ],
    # Instrutores e Fisioterapeutas podem apenas visualizar o dashboard.
    'Instrutor': [
        "view_dashboard_studio",
    ],
    'Fisio': [
        "view_dashboard_studio",
    ]
}

@receiver(post_save, sender=ColaboradorStudio)
def handle_colaborador_studio_permissions(sender, instance, **kwargs):
    """
    Signal que gerencia as permissões de objeto (per-studio) para um usuário.
    É disparado automaticamente pelo Django sempre que um objeto ColaboradorStudio é salvo.
    Isso garante que as permissões de um usuário estejam sempre sincronizadas com seu papel.
    """
    # Obtém os objetos relevantes a partir da instância que foi salva.
    usuario_autenticavel = instance.colaborador.usuario
    studio = instance.studio
    # Precisamos do nome da função para usar como chave
    papel_atual = instance.permissao.nome

    
    all_studio_perms = [perm[0] for perm in Studio._meta.permissions]
    for perm_codename in all_studio_perms:
        remove_perm(perm_codename, usuario_autenticavel, studio)

    perms_to_assign = PERMISSIONS_MAP.get(papel_atual, [])
    for perm_codename in perms_to_assign:
        assign_perm(perm_codename, usuario_autenticavel, studio)
