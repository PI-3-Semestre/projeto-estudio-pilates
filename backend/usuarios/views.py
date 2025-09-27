import uuid
from django.core.mail import send_mail
from django.urls import reverse
from django.shortcuts import redirect, render, get_object_or_404
from .forms import AlunoForm
from .repositories.alunos_repository import AlunoRepository
from .models import Aluno

aluno_repository = AlunoRepository()

# Create your views here.
 
#Views Cadastro Alunos
def lista_alunos(request):
    alunos = aluno_repository.get_all()
    context = {'alunos': alunos} 
    return render(request, 'usuarios/lista_alunos.html', context)

def cadastrar_aluno(request):
    if request.method == 'POST':
        form = AlunoForm(request.POST, request.FILES)
        if form.is_valid():
            aluno = form.save(commit=False)
            aluno.email_verificado = False
            aluno.save()

            token = aluno.token_verificado
            link_verificacao = request.build_absolute_uri(reverse('verificar_email', kwargs={'token': token}))

            assunto = 'Ative sua conta em nosso site'
            mensagem = f'Olá {aluno.nome},\n\nPor favor, clique no link abaixo para verificar seu e-mail e ativar sua conta:\n{link_verificacao}\n\nObrigado!' 
            remente = 'dmjnf23@gmail.com'
            send_mail(assunto, mensagem, remente, [aluno.email])

            return render(request, 'usuarios/cadastrar_aluno.html')

            aluno_repository.create(form.cleaned_data)
            return redirect('lista_alunos')

    else:
        form = AlunoForm()
    return render(request, 'usuarios/cadastrar_aluno.html', {'form': form})

def editar_aluno(request, pk):
    aluno = get_object_or_404(aluno_repository.get_all(), pk=pk)
    if request.method == 'POST':
        form = AlunoForm(request.POST, request.FILES, instance=aluno)
        if form.is_valid():
            aluno_repository.update(pk, form.cleaned_data)
            return redirect('lista_alunos')
    else:
        form = AlunoForm(instance=aluno)
    return render(request, 'usuarios/editar_aluno.html', {'form': form})

def excluir_aluno(request, pk):
    aluno = get_object_or_404(aluno_repository.get_all(), pk=pk)
    if request.method == 'POST':
        aluno_repository.delete(pk)
        return redirect('lista_alunos')
    return render(request, 'usuarios/confirmar_exclusao.html', {'aluno': aluno})

def verificar_email(request, token):
    aluno = get_object_or_404(Aluno, token_verificacao=token)
    if aluno:
        aluno.email_verificado = True
        aluno.save()

        return render(request, 'usuarios/email_verificado.html')
    else:

        return redirect('lista_alunos') 

