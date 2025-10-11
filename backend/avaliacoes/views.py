from avaliacoes.serializers import AvaliacaoSerializer
from avaliacoes.models import Avaliacao
from rest_framework.generics import CreateAPIView
from avaliacoes.controllers import crtler_criar_avalicao_aluno

# Create your views here.
class AvaliacaoCreateView(CreateAPIView):
    """
    View para criar uma nova avaliação inicial para um aluno específico 
    """
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer
    
    def perform_create(self, serializer):
        """
        Este método é chamado pelo DRF antes de salvar um novo objeto.
        Nós o usamos para "injetar" o aluno correto na avaliação.
        """
        #pega o id do aluno
        aluno_pk = self.kwargs.get('aluno_pk')
        #Busca o objeto Aluno no banco de dados ou da erro 404 se nao encontrar
        crtler_criar_avalicao_aluno(serializer, aluno_pk)