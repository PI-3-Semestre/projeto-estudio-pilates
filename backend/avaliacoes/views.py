from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from .serializers import AvaliacaoSerializer
from .models import Avaliacao
from usuarios.models import Colaborador # Importe o Colaborador
from alunos.models import Aluno

@extend_schema(tags=['Avaliações'])
class AvaliacaoListCreateView(generics.ListCreateAPIView):
    """
    View para Listar (GET) e Criar (POST) avaliações para um aluno específico.
    """
    serializer_class = AvaliacaoSerializer
    # MUDANÇA 1: Permite o acesso sem autenticação
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Este método filtra as avaliações para retornar apenas as do aluno
        especificado na URL.
        """
        aluno_pk = self.kwargs['aluno_pk']
        return Avaliacao.objects.filter(aluno__pk=aluno_pk).order_by('-data_avaliacao')

    def perform_create(self, serializer):
        """
        Associa o aluno (da URL) e um instrutor padrão (para testes)
        à nova avaliação antes de salvá-la.
        """
        aluno_pk = self.kwargs.get('aluno_pk')
        aluno = get_object_or_404(Aluno, pk=aluno_pk)
        
        # MUDANÇA 2: Lógica temporária para testes sem login
        # TODO: Voltar para a lógica de usuário logado quando a autenticação for implementada.
        # A linha original era:
        # instrutor = get_object_or_404(Colaborador, usuario=self.request.user)
        
        # Pega o primeiro colaborador do banco como um placeholder.
        # Certifique-se de que você tem pelo menos um colaborador cadastrado!
        instrutor = Colaborador.objects.first()
        
        serializer.save(aluno=aluno, instrutor=instrutor)

# --- VIEW PARA VER, ATUALIZAR E DELETAR UMA AVALIAÇÃO ESPECÍFICA ---
@extend_schema(tags=['Avaliações'])
class AvaliacaoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para Detalhar (GET), Atualizar (PUT/PATCH) e Deletar (DELETE)
    uma avaliação específica pelo seu ID.
    """
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer
    # MUDANÇA 3: Permite o acesso sem autenticação
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'