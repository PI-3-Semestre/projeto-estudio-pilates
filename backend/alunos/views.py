# alunos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from .models import Aluno
from .serializers import AlunoSerializer
from .permissions import IsAdminOrRecepcionista
from core.permissions import StudioPermissionMixin

@extend_schema(
    tags=['Alunos'],
    description='''
ViewSet para gerenciar os Alunos.

Fornece endpoints para:
- Listar todos os alunos (Apenas Colaboradores).
- Visualizar detalhes de um aluno por CPF (Apenas Colaboradores).
- Criar um novo aluno (Admin/Recepcionista).
- Atualizar um aluno existente (Admin/Recepcionista).
- Deletar um aluno (Admin/Recepcionista).
- **NOVO:** Acessar o próprio perfil do aluno logado (`/alunos/me/`).

**Permissões:**
- **Leitura (GET /alunos/):** Restrita a `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
- **Leitura (GET /alunos/{cpf}/):** Restrita a `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
- **Leitura (GET /alunos/me/):** Permitida para o próprio aluno autenticado.
- **Escrita (POST, PUT, PATCH, DELETE):** Restrita a `ADMIN_MASTER`, `ADMINISTRADOR` ou `RECEPCIONISTA`.
'''
)
@extend_schema_view(
    list=extend_schema(
        description='Lista todos os alunos (apenas colaboradores).'
    ),
    retrieve=extend_schema(
        description='Retorna os detalhes de um aluno específico (apenas colaboradores).'
    ),
    create=extend_schema(
        description='Cria um novo aluno (Admin/Recepcionista).'
    ),
    update=extend_schema(
        description='Atualiza completamente um aluno (Admin/Recepcionista).'
    ),
    partial_update=extend_schema(
        description='Atualiza parcialmente um aluno (Admin/Recepcionista).'
    ),
    destroy=extend_schema(
        description='Remove um aluno (Admin/Recepcionista).'
    ),
    me=extend_schema(
        description='Retorna os detalhes do perfil do aluno logado (apenas o próprio aluno).'
    )
)
class AlunoViewSet(StudioPermissionMixin, viewsets.ModelViewSet):
    """
    ViewSet que fornece a API completa para o gerenciamento de Alunos.
    """
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [IsAdminOrRecepcionista] # Esta permissão agora se aplica a todos os métodos CRUD
    lookup_field = 'usuario__cpf'
    studio_filter_field = 'unidades'

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Retorna os detalhes do perfil do aluno logado.
        Apenas o próprio aluno pode acessar este endpoint.
        """
        if not hasattr(request.user, 'aluno'):
            raise PermissionDenied("Você não possui um perfil de aluno.")
        
        aluno = get_object_or_404(Aluno, usuario=request.user)
        serializer = self.get_serializer(aluno)
        return Response(serializer.data)
