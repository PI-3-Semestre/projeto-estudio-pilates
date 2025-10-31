# agendamentos/views.py
from drf_spectacular.utils import extend_schema
from rest_framework import status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera
)
from .serializers import (
    HorarioTrabalhoSerializer, BloqueioAgendaSerializer, ModalidadeSerializer,
    AulaSerializer, AulaAlunoSerializer, ReposicaoSerializer, ListaEsperaSerializer,
    AgendamentoAlunoSerializer, AgendamentoStaffSerializer, CreditoAula
)
from .permissions import IsStaffAgendamento, IsOwnerDoAgendamento


# --- Views de Configuração de Agenda (Horarios, Bloqueios, Modalidades) ---
# Estas views geralmente são restritas a Staff
@extend_schema(
    tags=['Agendamentos - Horario Aula']
) 
class HorarioTrabalhoListCreateView(generics.ListCreateAPIView):
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos - Horario Aula']
)  
class HorarioTrabalhoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HorarioTrabalho.objects.all()
    serializer_class = HorarioTrabalhoSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos - Bloqueio Agenda']
)
class BloqueioAgendaListCreateView(generics.ListCreateAPIView):
    """ViewSet para gerenciar Bloqueios de Agenda."""
    queryset = BloqueioAgenda.objects.all()
    serializer_class = BloqueioAgendaSerializer
    permission_classes = [permissions.IsAuthenticated,
                         IsStaffAgendamento]
 
@extend_schema(
    tags=['Agendamentos - Bloqueio Agenda']
)   
class BloqueioAgendaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BloqueioAgenda.objects.all()
    serializer_class = BloqueioAgendaSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos - Modalidade']
) 
class ModalidadeListCreateView(generics.ListCreateAPIView):
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos - Modalidade']
)    
class ModalidadeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Modalidade.objects.all()
    serializer_class = ModalidadeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffAgendamento]

@extend_schema(
    tags=['Agendamentos - Aulas']
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
    tags=['Agendamentos - Aulas']
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

    # --- INÍCIO DA LÓGICA ATUALIZADA (ISSUE #63) ---
    def perform_create(self, serializer):
        """
        Salva o agendamento e consome o crédito (se aplicável),
        seja para o fluxo de Staff ou Aluno.
        """
        
        if isinstance(serializer, AgendamentoAlunoSerializer):
            # --- FLUXO ALUNO ---
            if not hasattr(self.request.user, 'aluno'):
                raise PermissionDenied("Você não possui um perfil de aluno para realizar este agendamento.")
            
            # O 'validate' do serializer já validou e colocou o crédito nos dados
            credito_a_utilizar = serializer.validated_data.pop('credito_a_utilizar', None)
            
            # Salva o agendamento associando ao aluno logado
            agendamento = serializer.save(aluno=self.request.user.aluno)

            # Consome o crédito (lógica idêntica ao 'create' do StaffSerializer)
            if credito_a_utilizar:
                agendamento.credito_utilizado = credito_a_utilizar
                credito_a_utilizar.status = CreditoAula.StatusCredito.UTILIZADA
                credito_a_utilizar.save()
                agendamento.save() 

        else:
            # --- FLUXO STAFF ---
            # O 'AgendamentoStaffSerializer' tem seu próprio método 'create'
            # que já contém a lógica de consumo de crédito.
            # Apenas chamamos o 'save()' e o serializer cuida do resto.
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
    tags=['Agendamentos - Reposição Aula']
)
class ReposicaoListCreateView(generics.ListCreateAPIView):
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras

@extend_schema(
    tags=['Agendamentos - Reposição Aula']
)
class ReposicaoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reposicao.objects.all()
    serializer_class = ReposicaoSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras

@extend_schema(
    tags=['Agendamentos - Lista Espera']
)
class ListaEsperaListCreateView(generics.ListCreateAPIView):
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras

@extend_schema(
    tags=['Agendamentos - Lista Espera']
)
class ListaEsperaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ListaEspera.objects.all()
    serializer_class = ListaEsperaSerializer
    permission_classes = [permissions.IsAuthenticated] 
    # TODO: Definir regras 