# agendamentos/views.py
from drf_spectacular.utils import extend_schema
from rest_framework import status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera
)
from .serializers import (
    HorarioTrabalhoSerializer, BloqueioAgendaSerializer, ModalidadeSerializer,
    AulaSerializer, AulaAlunoSerializer, ReposicaoSerializer, ListaEsperaSerializer,
    AgendamentoAlunoSerializer, AgendamentoStaffSerializer
)
from .permissions import IsStaffAgendamento, IsOwnerDoAgendamento


# --- Views de Configuração de Agenda (Horarios, Bloqueios, Modalidades) ---
# Estas views geralmente são restritas a Staff
@extend_schema(
    tags=['Agendamentos']
) 
class HorarioTrabalhoListCreateView(generics.ListCreateAPIView):
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos']
)  
class HorarioTrabalhoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos']
)
class BloqueioAgendaListCreateView(generics.ListCreateAPIView):
    """ViewSet para gerenciar Bloqueios de Agenda."""
    queryset = BloqueioAgenda.objects.all()
    serializer_class = BloqueioAgendaSerializer
    permission_classes = [permissions.IsAuthenticated,
                         IsStaffAgendamento]
 
@extend_schema(
    tags=['Agendamentos']
)   
class BloqueioAgendaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BloqueioAgenda.objects.all()
    serializer_class = BloqueioAgendaSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos']
) 
class ModalidadeListCreateView(generics.ListCreateAPIView):
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos']
)    
class ModalidadeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos']
)
# --- Views de Gestão de Aulas (Aula) ---
# A criação de aulas também é restrita a Staff
# --- Views de Gestão de Aulas (Aula) ---
# AQUI RESTAURAMOS SUA LÓGICA DE FILTRAGEM ORIGINAL
class AulaListCreateView(generics.ListCreateAPIView):
    """
    View para listar (GET) e criar (POST) aulas.
    A criação é restrita a Staff.
    A listagem é filtrada por perfil.
    """
    serializer_class = AulaSerializer
    
    def get_permissions(self):
        """Define permissões diferentes para POST (só staff) e GET (autenticado)"""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsStaffAgendamento()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        Filtra o queryset de aulas com base no perfil do usuário.
        (Lógica movida do seu AulaViewSet original)
        """
        user = self.request.user
        
        if user.is_superuser:
            return Aula.objects.all()
        
        if not hasattr(user, 'colaborador'):
            # Se não for colaborador (ex: Aluno), não vê nenhuma aula nesta view
            # (Alunos devem ver aulas de outra forma, talvez um endpoint /aluno/aulas)
             return Aula.objects.none()

        perfis = user.colaborador.perfis.values_list('nome', flat=True)

        if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'] for perfil in perfis):
            return Aula.objects.all()
        
        if any(perfil in ['INSTRUTOR', 'FISIOTERAPEUTA'] for perfil in perfis):
            return Aula.objects.filter(
                Q(instrutor_principal=user.colaborador) | Q(instrutor_substituto=user.colaborador)
            ).distinct()

        return Aula.objects.none()

@extend_schema(
    tags=['Agendamentos']
)
class AulaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para detalhar, atualizar e deletar aulas.
    Acesso restrito a Staff, mas a filtragem de queryset garante 
    que Instrutores só acessem as suas.
    """
    serializer_class = AulaSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento] # Staff pode editar

    def get_queryset(self):
        """
        Garante que um Instrutor só possa editar/deletar suas próprias aulas,
        enquanto Admins podem editar/deletar qualquer uma.
        (Lógica movida do seu AulaViewSet original)
        """
        user = self.request.user
        
        if user.is_superuser:
            return Aula.objects.all()
        
        if not hasattr(user, 'colaborador'):
            return Aula.objects.none()

        perfis = user.colaborador.perfis.values_list('nome', flat=True)

        if any(perfil in ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'] for perfil in perfis):
            return Aula.objects.all()
        
        if any(perfil in ['INSTRUTOR', 'FISIOTERAPEUTA'] for perfil in perfis):
            return Aula.objects.filter(
                Q(instrutor_principal=user.colaborador) | Q(instrutor_substituto=user.colaborador)
            ).distinct()

        return Aula.objects.none()

   
# --- Views de Agendamento (AulaAluno) ---
@extend_schema(
    tags=['Agendamentos - Inscrições']
) 
class AgendamentoAlunoListCreateView(generics.ListCreateAPIView):
    queryset = AulaAluno.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        staff_permission = IsStaffAgendamento()
        if staff_permission.has_permission(self.request, self):
            return AgendamentoStaffSerializer
        return AgendamentoAlunoSerializer

    def perform_create(self, serializer):
        if isinstance(serializer, AgendamentoAlunoSerializer):
            if hasattr(self.request.user, 'aluno'):
                serializer.save(aluno=self.request.user.aluno)
            else:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Você não possui um perfil de aluno para realizar este agendamento.")
        else:
            serializer.save()

@extend_schema(
    tags=['Agendamentos - Inscrições']
)
class AgendamentoAlunoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AulaAluno.objects.all()
    serializer_class = AgendamentoStaffSerializer 
    permission_classes = [
        permissions.IsAuthenticated,
        (IsOwnerDoAgendamento | IsStaffAgendamento)
    ]

# --- Views de Reposição e Lista de Espera ---

@extend_schema(
    tags=['Agendamentos']
)
class ReposicaoListCreateView(generics.ListCreateAPIView):
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras

@extend_schema(
    tags=['Agendamentos']
)
class ReposicaoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras

@extend_schema(
    tags=['Agendamentos']
)
class ListaEsperaListCreateView(generics.ListCreateAPIView):
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras

@extend_schema(
    tags=['Agendamentos']
)
class ListaEsperaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras 