from avaliacoes.serializers import AvaliacaoSerializer
from avaliacoes.models import Avaliacao
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from avaliacoes.controllers import crtler_criar_avalicao_aluno

# Create your views here.
class AvaliacaoListCreateView(ListCreateAPIView):
    """
    View para Listar (GET) e Criar (POST) avaliações para um aluno específico.
    """
    serializer_class = AvaliacaoSerializer

    def get_queryset(self):
        """
        Este método filtra as avaliações para retornar apenas as do aluno
        especificado na URL.
        """
        aluno_pk = self.kwargs['aluno_pk']
        return Avaliacao.objects.filter(aluno__pk=aluno_pk).order_by('-data_avaliacao')

    def perform_create(self, serializer):
        """
        Associa o aluno da URL à nova avaliação antes de salvá-la.
        """
        aluno_pk = self.kwargs.get('aluno_pk')
        crtler_criar_avalicao_aluno(serializer, aluno_pk)

# --- VIEW PARA VER, ATUALIZAR E DELETAR UMA AVALIAÇÃO ESPECÍFICA ---
class AvaliacaoRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """
    View para Detalhar (GET), Atualizar (PUT/PATCH) e Deletar (DELETE)
    uma avaliação específica pelo seu ID.
    """
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer
    lookup_field = 'pk' # Informa que o ID da avaliação virá na URL
