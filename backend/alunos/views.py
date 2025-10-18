# alunos/views.py
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
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
    # Define o conjunto de dados base para esta view: todos os alunos.
    queryset = Aluno.objects.all()
    
    # Define o serializador que será usado para entrada e saída de dados.
    serializer_class = AlunoSerializer
    
    # Define a classe de permissão que controla o acesso a esta view.
    permission_classes = [IsAdminOrRecepcionista]
    
    # Configura o campo de busca na URL para ser o CPF, em vez do ID padrão.
    lookup_field = 'cpf'
