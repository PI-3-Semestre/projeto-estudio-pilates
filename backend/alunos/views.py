# alunos/views.py
from rest_framework import viewsets
# +++ MODIFICADO: Adicionado OpenApiParameter e extend_schema_view para a decoração.
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from .models import Aluno
from .serializers import AlunoSerializer
from .permissions import IsAdminOrRecepcionista

@extend_schema(
    tags=['Alunos'],
    description='''
ViewSet para gerenciar os Alunos.

Fornece endpoints para:
- Listar todos os alunos (qualquer usuário autenticado).
- Visualizar detalhes de um aluno por CPF (qualquer usuário autenticado).
- Criar um novo aluno (Admin/Recepcionista).
- Atualizar um aluno existente (Admin/Recepcionista).
- Deletar um aluno (Admin/Recepcionista).

**Permissões:**
- **Leitura (GET):** Permitida para qualquer usuário autenticado (Instrutores, Fisioterapeutas, etc.).
- **Escrita (POST, PUT, PATCH, DELETE):** Restrita a `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
'''
)
@extend_schema_view(
    list=extend_schema(
        description='Lista todos os alunos.'
    ),
    retrieve=extend_schema(
        description='Retorna os detalhes de um aluno específico.',
        parameters=[
            OpenApiParameter(
                name='cpf',
                type=str,
                location=OpenApiParameter.PATH,
                description='CPF do Aluno (utilizado como identificador na URL).'
            )
        ]
    ),
    create=extend_schema(
        description='Cria um novo aluno.'
    ),
    update=extend_schema(
        description='Atualiza completamente um aluno.',
        parameters=[
            OpenApiParameter(
                name='cpf',
                type=str,
                location=OpenApiParameter.PATH,
                description='CPF do Aluno (utilizado como identificador na URL).'
            )
        ]
    ),
    partial_update=extend_schema(
        description='Atualiza parcialmente um aluno.',
        parameters=[
            OpenApiParameter(
                name='cpf',
                type=str,
                location=OpenApiParameter.PATH,
                description='CPF do Aluno (utilizado como identificador na URL).'
            )
        ]
    ),
    destroy=extend_schema(
        description='Remove um aluno.',
        parameters=[
            OpenApiParameter(
                name='cpf',
                type=str,
                location=OpenApiParameter.PATH,
                description='CPF do Aluno (utilizado como identificador na URL).'
            )
        ]
    )
)
class AlunoViewSet(viewsets.ModelViewSet):
    """
    ViewSet que fornece a API completa para o gerenciamento de Alunos.
    
    - `GET /alunos/`: Lista todos os alunos.
    - `POST /alunos/`: Cria um novo aluno.
    - `GET /alunos/{cpf}/`: Retorna os detalhes de um aluno específico.
    - `PUT /alunos/{cpf}/`: Atualiza completamente um aluno.
    - `PATCH /alunos/{cpf}/`: Atualiza parcialmente um aluno.
    - `DELETE /alunos/{cpf}/`: Remove um aluno.
    """
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [IsAdminOrRecepcionista]
    lookup_field = 'usuario__cpf'
