# core/permissions.py
class StudioPermissionMixin:
    """
    Mixin para filtrar querysets com base nos estúdios do colaborador logado.
    Aplica a regra de que ADMIN_MASTER vê tudo, e outros colaboradores
    (Admin, Recep, etc.) veem apenas dados de seus estúdios.
    """
    # A ViewSet que usar este mixin DEVE definir este campo.
    # Ex: 'studio', 'aula__studio', 'unidades'
    studio_filter_field = None

    def get_queryset(self):
        """
        Sobrescreve o método get_queryset da ViewSet para aplicar a lógica de filtro.
        """
        # Pega a queryset original definida na ViewSet (ex: Aula.objects.all())
        queryset = super().get_queryset()
        user = self.request.user

        # Se o usuário não for um colaborador (ex: Aluno), retorna a queryset original.
        # Alunos precisam ver todas as aulas para poderem se agendar.
        if not user.is_authenticated or not hasattr(user, 'colaborador'):
            return queryset

        perfis = user.colaborador.perfis.values_list('nome', flat=True)

        # 1. ADMIN_MASTER sempre vê tudo.
        if 'ADMIN_MASTER' in perfis:
            return queryset

        # 2. Outros perfis de staff (Admin, Recep, etc.) têm os dados filtrados.
        if any(p in ['ADMINISTRADOR', 'RECEPCIONISTA', 'INSTRUTOR', 'FISIOTERAPEUTA'] for p in perfis):
            if not self.studio_filter_field:
                # Gera um erro claro se o mixin for usado sem configurar o campo de filtro.
                raise NotImplementedError(
                    f"{self.__class__.__name__} usa StudioPermissionMixin mas não definiu 'studio_filter_field'."
                )

            studios_do_colaborador = user.colaborador.unidades.all()
            
            # Constrói o filtro dinamicamente. Ex: {'studio__in': studios_do_colaborador}
            filter_kwargs = {f"{self.studio_filter_field}__in": studios_do_colaborador}
            
            # Retorna a queryset filtrada e remove duplicatas se houver joins.
            return queryset.filter(**filter_kwargs).distinct()

        # Por segurança, se um colaborador não tiver um perfil que se encaixe nas regras, não retorna nada.
        return queryset.none()
