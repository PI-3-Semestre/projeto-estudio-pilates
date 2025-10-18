# studios/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from guardian.shortcuts import assign_perm, remove_perm
from .models import ColaboradorStudio, Studio

# Este dicionário funciona como uma Matriz de Controle de Acesso Baseado em Papel (Role-Based Access Control).
# Ele mapeia um papel (definido em ColaboradorStudio.PermissaoChoices) para uma lista de codinomes de permissão
# (definidos na classe Meta do modelo Studio).
PERMISSIONS_MAP = {
    # Administradores têm todas as permissões no studio.
    ColaboradorStudio.PermissaoChoices.ADMIN: [
        "view_dashboard_studio",
        "manage_finances_studio",
        "manage_collaborators_studio",
        "manage_enrollments_studio",
    ],
    # Recepcionistas podem ver o dashboard e gerenciar matrículas.
    ColaboradorStudio.PermissaoChoices.RECEP: [
        "view_dashboard_studio",
        "manage_enrollments_studio",
    ],
    # Instrutores e Fisioterapeutas podem apenas visualizar o dashboard.
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
    Signal que gerencia as permissões de objeto (per-studio) para um usuário.
    É disparado automaticamente pelo Django sempre que um objeto ColaboradorStudio é salvo.
    Isso garante que as permissões de um usuário estejam sempre sincronizadas com seu papel.
    """
    # Obtém os objetos relevantes a partir da instância que foi salva.
    usuario_autenticavel = instance.colaborador.usuario
    studio = instance.studio
    papel_atual = instance.permissao

    # 1. Limpa todas as permissões de studio existentes para este usuário neste studio específico.
    # Este passo é CRUCIAL para garantir que, ao rebaixar o papel de um usuário
    # (ex: de Admin para Instrutor), as permissões de Admin sejam revogadas.
    all_studio_perms = [perm[0] for perm in Studio._meta.permissions]
    for perm_codename in all_studio_perms:
        remove_perm(perm_codename, usuario_autenticavel, studio)

    # 2. Atribui as novas permissões com base no papel atual, usando o mapa de permissões.
    perms_to_assign = PERMISSIONS_MAP.get(papel_atual, [])
    for perm_codename in perms_to_assign:
        assign_perm(perm_codename, usuario_autenticavel, studio)
