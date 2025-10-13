# studios/controllers.py
from .models import Studio

class StudioController:
    """
    Camada de lógica de negócio para a entidade Studio.
    Isola a lógica das queries do Django das views.
    """
    def get_studios_for_user(self, user):
        """
        Retorna uma queryset de Studios aos quais o usuário tem acesso.
        Um superusuário tem acesso a todos.
        Um usuário comum vê apenas os studios aos quais ele tem vínculo.
        """
        if user.is_superuser:
            return Studio.objects.all()

        # O related_name 'vinculos_studio' vem do modelo ColaboradorStudio
        # e está associado ao modelo Colaborador.
        # user.colaborador_profile é uma suposição de como você nomeou o OneToOneField
        # no modelo Usuario para acessar o Colaborador. Ajuste se o nome for outro.
        try:
            colaborador_profile = user.colaborador_profile
        except AttributeError:
            # Usuário não tem perfil de colaborador, não pode ver nenhum studio.
            return Studio.objects.none()

        studio_ids = colaborador_profile.vinculos_studio.values_list('studio_id', flat=True)
        return Studio.objects.filter(id__in=studio_ids)