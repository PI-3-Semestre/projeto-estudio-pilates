# agendamentos/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

# --- ALTERAÇÃO INÍCIO: Importar as novas classes de permissão ---
from .permissions import HasRole, IsOwnerDaAula
# --- ALTERAÇÃO FIM ---
# --- ALTERAÇÃO INÍCIO: Importar as novas classes de permissão ---
from .permissions import HasRole, IsOwnerDaAula
# --- ALTERAÇÃO FIM ---
from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera
)
from .serializers import (
    HorarioTrabalhoSerializer,
    BloqueioAgendaSerializer,
    ModalidadeSerializer,
    AulaReadSerializer,
    AulaAlunoSerializer, ReposicaoSerializer, ListaEsperaSerializer
)

class HorarioTrabalhoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Horários de Trabalho."""
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    # --- ALTERAÇÃO INÍCIO: Usando a nova permissão HasRole ---
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
    # --- ALTERAÇÃO FIM ---
    # --- ALTERAÇÃO INÍCIO: Usando a nova permissão HasRole ---
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
    # --- ALTERAÇÃO FIM ---

class BloqueioAgendaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Bloqueios de Agenda."""
    queryset = BloqueioAgenda.objects.all()
    # --- ALTERAÇÃO INÍCIO: Usando a nova permissão HasRole conforme critério de aceitação ---
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
    # --- ALTERAÇÃO FIM ---

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return BloqueioAgendaReadSerializer
        return BloqueioAgendaWriteSerializer
    # --- ALTERAÇÃO INÍCIO: Usando a nova permissão HasRole conforme critério de aceitação ---
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
    # --- ALTERAÇÃO FIM ---

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return BloqueioAgendaReadSerializer
        return BloqueioAgendaWriteSerializer

class ModalidadeViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar as Modalidades de aula."""
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    # --- ALTERAÇÃO INÍCIO: Usando a nova permissão HasRole ---
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
    # --- ALTERAÇÃO FIM ---
    # --- ALTERAÇÃO INÍCIO: Usando a nova permissão HasRole ---
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
    # --- ALTERAÇÃO FIM ---

class AulaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Aulas e inscrições de alunos."""
    # --- REMOVIDO: A linha permission_classes = [IsAuthenticated] foi removida ---

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AulaReadSerializer
        return AulaWriteSerializer
    
    # --- ALTERAÇÃO INÍCIO: Método para aplicar permissões granulares ---
    def get_permissions(self):
        """
        Define as permissões com base na ação (request method) sendo executada.
        - Listar/Ver: Qualquer usuário autenticado pode ver (a filtragem é feita no queryset).
        - Criar/Destruir: Apenas Admins.
        - Atualizar: Admins, Recepcionistas ou o próprio Instrutor da aula.
        """
        if self.action in ['list', 'retrieve']:
            # Qualquer um logado pode ver, o get_queryset já filtra o que cada um pode ver
            self.permission_classes = [IsAuthenticated]
        elif self.action in ['create', 'destroy']:
            # Apenas Admin Master e Administrador podem criar ou deletar aulas
            self.permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
        elif self.action in ['update', 'partial_update']:
            # Para editar, o usuário deve ser:
            # (Admin OU Recepcionista) OU (ser o dono da aula)
            # A permissão IsOwnerDaAula será verificada apenas se as de HasRole falharem
            self.permission_classes = [
                HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']) | IsOwnerDaAula
            ]
        else:
            # Para outras ações (como 'inscrever_aluno'), definimos uma permissão padrão.
            # Ajuste conforme necessário.
            self.permission_classes = [IsAuthenticated] 
        
        return [permission() for permission in self.permission_classes]
    # --- ALTERAÇÃO FIM ---
    # --- REMOVIDO: A linha permission_classes = [IsAuthenticated] foi removida ---

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AulaReadSerializer
        return AulaWriteSerializer
    
    # --- ALTERAÇÃO INÍCIO: Método para aplicar permissões granulares ---
    def get_permissions(self):
        """
        Define as permissões com base na ação (request method) sendo executada.
        - Listar/Ver: Qualquer usuário autenticado pode ver (a filtragem é feita no queryset).
        - Criar/Destruir: Apenas Admins.
        - Atualizar: Admins, Recepcionistas ou o próprio Instrutor da aula.
        """
        if self.action in ['list', 'retrieve']:
            # Qualquer um logado pode ver, o get_queryset já filtra o que cada um pode ver
            self.permission_classes = [IsAuthenticated]
        elif self.action in ['create', 'destroy']:
            # Apenas Admin Master e Administrador podem criar ou deletar aulas
            self.permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR'])]
        elif self.action in ['update', 'partial_update']:
            # Para editar, o usuário deve ser:
            # (Admin OU Recepcionista) OU (ser o dono da aula)
            # A permissão IsOwnerDaAula será verificada apenas se as de HasRole falharem
            self.permission_classes = [
                HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA']) | IsOwnerDaAula
            ]
        else:
            # Para outras ações (como 'inscrever_aluno'), definimos uma permissão padrão.
            # Ajuste conforme necessário.
            self.permission_classes = [IsAuthenticated] 
        
        return [permission() for permission in self.permission_classes]
    # --- ALTERAÇÃO FIM ---

    def get_queryset(self):
        """
        Filtra o queryset de aulas com base no perfil do usuário.
        - Admin/Recepcionista: veem todas as aulas.
        - Instrutor/Fisioterapeuta: veem apenas suas próprias aulas.
        """
        user = self.request.user
        if not hasattr(user, 'colaborador'):
            return Aula.objects.none()

        perfis = user.colaborador.perfis.values_list('nome', flat=True)

        if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'] for perfil in perfis):
            return Aula.objects.all().order_by('data_hora_inicio')
            return Aula.objects.all().order_by('data_hora_inicio')
        
        if any(perfil in ['INSTRUTOR', 'FISIOTERAPEUTA'] for perfil in perfis):
            return Aula.objects.filter(
                Q(instrutor_principal=user.colaborador) | Q(instrutor_substituto=user.colaborador)
            ).distinct().order_by('data_hora_inicio')
            ).distinct().order_by('data_hora_inicio')

        return Aula.objects.none()

    # A ação customizada 'inscrever_aluno' usará as permissões definidas no 'else' de get_permissions
    # A ação customizada 'inscrever_aluno' usará as permissões definidas no 'else' de get_permissions
    @action(detail=True, methods=['post'], url_path='inscrever')
    def inscrever_aluno(self, request, pk=None):
        # ... (código da função inalterado) ...
        # ... (código da função inalterado) ...
        aula = self.get_object()
        aluno_id = request.data.get('aluno_id')
        if not aluno_id:
            return Response({'error': "O campo 'aluno_id' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': "O campo 'aluno_id' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = AulaAlunoSerializer(data={'aula': aula.pk, 'aluno': aluno_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ... (Restante do arquivo views.py inalterado) ...
# ... (Restante do arquivo views.py inalterado) ...
class AulaAlunoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar os agendamentos dos alunos."""
    queryset = AulaAluno.objects.all()
    serializer_class = AulaAlunoSerializer
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])] # Exemplo de uso
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])] # Exemplo de uso

class ReposicaoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar as reposições dos alunos."""
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [IsAuthenticated] # Exemplo de uso
    permission_classes = [IsAuthenticated] # Exemplo de uso

class ListaEsperaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar a lista de espera."""
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])] # Exemplo de uso
    permission_classes = [HasRole.for_roles(['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'])] # Exemplo de uso