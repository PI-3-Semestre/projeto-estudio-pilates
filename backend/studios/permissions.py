# studios/permissions.py
from rest_framework import permissions

class HasObjectPermission(permissions.BasePermission):
    """
    Permissão customizada do DRF que verifica se o request.user
    tem uma permissão de objeto específica.
    Uso: permission_classes = [HasObjectPermission('studios.nome_da_permissao')]
    """
    def __init__(self, required_permission):
        self.required_permission = required_permission
        super().__init__()

    def has_object_permission(self, request, view, obj):
        # A mágica acontece aqui: o django-guardian provê o método has_perm
        # que checa a permissão para um objeto específico.
        return request.user.has_perm(self.required_permission, obj)