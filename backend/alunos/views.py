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
- Listar todos os alunos.
- Visualizar detalhes de um aluno (busca por CPF).
- Criar um novo aluno.
- Atualizar um aluno existente.
- Deletar um aluno.

**Nota:** Todas as operações neste endpoint requerem permissão de `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
'''
)
class AlunoViewSet(viewsets.ModelViewSet):
    """
    View para listar, criar, atualizar e deletar Alunos.
    A criação e modificação de alunos é restrita a Administradores e Recepcionistas.
    """
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [IsAdminOrRecepcionista]
    lookup_field = 'cpf' # Permite buscar alunos pelo CPF na URL