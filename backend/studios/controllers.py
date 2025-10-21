# studios/controllers.py
from django.core.exceptions import PermissionDenied
from .models import Studio

class StudioController:
    """
    Camada de lógica de negócio para a entidade Studio.
    Abstrai a lógica de permissões e de acesso ao banco de dados, 
    mantendo as views mais limpas e focadas na API.
    """
    def _can_manage_studios(self, user):
        """ 
        Método interno para verificar se um usuário tem perfil de gerenciamento.
        Retorna True se o usuário for superuser, ADMIN_MASTER ou ADMINISTRADOR.
        """
        if user.is_superuser:
            return True
        try:
            # Acessa o perfil de colaborador do usuário.
            profile = user.colaborador
            # Verifica se o colaborador possui algum dos perfis de gerenciamento.
            return profile.perfis.filter(nome__in=['ADMIN_MASTER', 'ADMINISTRADOR']).exists()
        except user.colaborador.RelatedObjectDoesNotExist:
            # Se o usuário não tem um perfil de colaborador, não pode gerenciar.
            return False

    def get_studios_for_user(self, user):
        """
        Retorna uma queryset de Studios aos quais o usuário tem acesso.
        - Administradores veem todos os studios.
        - Outros colaboradores veem apenas os studios aos quais estão associados.
        """
        # Se o usuário pode gerenciar, retorna todos os studios.
        if self._can_manage_studios(user):
            return Studio.objects.all()
        
        try:
            # Para usuários comuns (não-admins), busca os studios associados 
            # ao seu perfil de colaborador através da nova tabela de relacionamento.
            return Studio.objects.filter(colaboradores_vinculados__colaborador=user.colaborador)
        except user.colaborador.RelatedObjectDoesNotExist:
            # Se o usuário não é um colaborador, retorna uma lista vazia.
            return Studio.objects.none()

    def create_studio(self, user, data):
        """
        Cria um novo studio, mas apenas se o usuário tiver permissão.
        """
        # Barreira de permissão: levanta uma exceção se o usuário não puder gerenciar.
        if not self._can_manage_studios(user):
            raise PermissionDenied("Você não tem permissão para criar studios.")
        
        return Studio.objects.create(**data)

    def update_studio(self, user, studio_instance, data):
        """
        Atualiza um studio existente, mas apenas se o usuário tiver permissão.
        """
        # Barreira de permissão.
        if not self._can_manage_studios(user):
            raise PermissionDenied("Você não tem permissão para editar studios.")

        # Atualiza os campos da instância com os novos dados.
        for attr, value in data.items():
            setattr(studio_instance, attr, value)
        studio_instance.save()
        return studio_instance

    def delete_studio(self, user, studio_instance):
        """
        Deleta um studio, mas apenas se o usuário tiver permissão.
        """
        # Barreira de permissão.
        if not self._can_manage_studios(user):
            raise PermissionDenied("Você não tem permissão para deletar studios.")
        
        studio_instance.delete()
