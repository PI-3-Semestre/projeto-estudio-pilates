from django.core.mail import send_mail
from django.urls import reverse
from django.shortcuts import redirect, render, get_object_or_404
from rest_framework import generics
from .forms import AlunoForm
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

    
    def perform_create(self, serializer):
        aluno = serializer.save(email_verificado=False)

        token = aluno.token_verificacao
        link_verificacao = self.request.build_absolute_uri(reverse('verificar_email', kwargs={'token': token}))

        assunto = 'Ative sua conta em nosso site'
        mensagem = (
            f'Olá {aluno.nome},\n\n'
            'Por favor, clique no link abaixo para verificar seu email e ativar sua conta:\n'
            f'{link_verificacao}\n\n'
            'Obrigado!'
        )
        remetente = 'dmjnf23@gmail.com' 
        send_mail(assunto, mensagem, remetente, [aluno.email])


class AlunoListagemView(generics.ListAPIView):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer


class AlunoAtualizarDeletarView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    lookup_field = 'pk'

def verificar_email(request, token):
    aluno = get_object_or_404(Aluno, token_verificacao=token)
    if aluno:
        aluno.email_verificado = True
        aluno.save()

        return render(request, 'usuarios/email_verificado.html')
    else:

        return redirect('lista_alunos') 

