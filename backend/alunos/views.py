# alunos/views.py
from rest_framework import viewsets
# +++ MODIFICADO: Adicionado OpenApiParameter para a decoração.
from drf_spectacular.utils import extend_schema, OpenApiParameter
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
''',
    # +++ ADICIONADO: Define explicitamente o parâmetro 'cpf' na URL para a documentação.
    parameters=[
        OpenApiParameter(
            name='cpf', 
            type=str, 
            location=OpenApiParameter.PATH,
            description='CPF do Aluno (utilizado como identificador na URL).'
        )
    ]
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
    lookup_field = 'cpf'