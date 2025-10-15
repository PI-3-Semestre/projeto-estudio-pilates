# studios/controllers.py
from django.core.exceptions import PermissionDenied
from .models import Studio

class StudioController:
    """
    Camada de lógica de negócio para a entidade Studio.
    Isola a lógica das queries do Django das views.
    """
    def _can_manage_studios(self, user):
        """ Verifica se o usuário tem permissão para gerenciar studios. """
        if user.is_superuser:
            return True
        try:
            profile = user.colaborador
            return profile.perfil in ['ADMIN_MASTER', 'ADMINISTRADOR']
        except AttributeError:
            return False

    def get_studios_for_user(self, user):
        """
        Retorna uma queryset de Studios aos quais o usuário tem acesso.
        """
        if self._can_manage_studios(user):
            return Studio.objects.all()
        
        try:
            # Acessa o perfil de colaborador através do related_name do OneToOneField
            colaborador_profile = user.colaborador
            # CORREÇÃO: Usa a relação direta 'unidades' para buscar os studios
            return colaborador_profile.unidades.all()
        except AttributeError:
            # Se não for um colaborador, não vê nenhum studio.
            return Studio.objects.none()

    def create_studio(self, user, data):
        """
        Cria um novo studio se o usuário tiver permissão.
        """
        if not self._can_manage_studios(user):
            raise PermissionDenied("Você não tem permissão para criar studios.")
        
        return Studio.objects.create(**data)

    def update_studio(self, user, studio_instance, data):
        """
        Atualiza um studio existente se o usuário tiver permissão.
        """
        if not self._can_manage_studios(user):
            raise PermissionDenied("Você não tem permissão para editar studios.")

        for attr, value in data.items():
            setattr(studio_instance, attr, value)
        studio_instance.save()
        return studio_instance

    def delete_studio(self, user, studio_instance):
        """
        Deleta um studio se o usuário tiver permissão.
        """
        if not self._can_manage_studios(user):
            raise PermissionDenied("Você não tem permissão para deletar studios.")
        
        studio_instance.delete()