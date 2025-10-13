from rest_framework import generics
from .repositories.alunos_repository import AlunoRepository
from .models import Aluno
from .serializers import AlunoSerializer

aluno_repository = AlunoRepository()

# Create your views here.
 #Views Cadastro Alunos
class AlunoListCreateView(generics.ListCreateAPIView):
    """
    View para Listar (GET) e Criar (POST) alunos.
    """
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer

class AlunoListagemView(generics.ListAPIView):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer


class AlunoAtualizarDeletarView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    lookup_field = 'pk'
