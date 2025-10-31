from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from .models import Aluno
from .serializers import AlunoSerializer
from .permissions import IsOwnerOrAdminOrRecepcionista

@extend_schema(
    tags=['Alunos'],
    description='''
ViewSet para gerenciar os Alunos.

**Permissões:**
- **Listar (GET):** Apenas `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
- **Visualizar (GET):** O próprio aluno, ou `ADMIN_MASTER`, `ADMINISTRADOR`, `RECEPCIONISTA`.
- **Criar (POST):** `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
- **Atualizar (PUT/PATCH):** O próprio aluno, ou `ADMIN_MASTER`, `ADMINISTRADOR`, `RECEPCIONISTA`.
- **Deletar (DELETE):** `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
'''
)
@extend_schema_view(
    list=extend_schema(
        summary='Lista todos os alunos',
        description='Lista todos os alunos (apenas para admins/recepcionistas).'
    ),
    retrieve=extend_schema(
        summary='Busca um aluno pelo CPF',
        description='Retorna os detalhes de um aluno específico.',
        parameters=[
            OpenApiParameter(
                name='usuario__cpf',
                type=str,
                location=OpenApiParameter.PATH,
                description='CPF do Aluno (utilizado como identificador na URL).'
            )
        ]
    ),
    create=extend_schema(
        summary='Cria um novo aluno',
        description='Cria um novo aluno (apenas para admins/recepcionistas).'
    ),
    update=extend_schema(
        summary='Atualiza os dados de um aluno',
        description='Atualiza completamente um aluno.',
        parameters=[
            OpenApiParameter(
                name='usuario__cpf',
                type=str,
                location=OpenApiParameter.PATH,
                description='CPF do Aluno (utilizado como identificador na URL).'
            )
        ]
    ),
    partial_update=extend_schema(
        summary='Atualiza parcialmente os dados de um aluno',
        description='Atualiza parcialmente um aluno.',
        parameters=[
            OpenApiParameter(
                name='usuario__cpf',
                type=str,
                location=OpenApiParameter.PATH,
                description='CPF do Aluno (utilizado como identificador na URL).'
            )
        ]
    ),
    destroy=extend_schema(
        summary='Deleta um aluno',
        description='Remove um aluno (apenas para admins/recepcionistas).'
    )
)
class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [IsOwnerOrAdminOrRecepcionista]
    lookup_field = 'usuario__cpf'

    def get_queryset(self):
        """
        Este viewset retorna:
        - Todos os alunos para usuários com perfil de admin ou recepcionista.
        - Apenas o perfil do próprio aluno para usuários sem esses perfis.
        """
        user = self.request.user
        if not user.is_authenticated:
            return Aluno.objects.none()

        if user.is_superuser:
            return Aluno.objects.all()
        
        try:
            if user.colaborador.perfis.filter(nome__in=['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']).exists():
                return Aluno.objects.all()
        except ObjectDoesNotExist:
            # Se não for um colaborador, pode ser um aluno
            pass
            
        return Aluno.objects.filter(usuario=user)