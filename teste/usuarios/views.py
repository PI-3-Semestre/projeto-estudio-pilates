from django.shortcuts import redirect, render, get_object_or_404
from .forms import AlunoForm
from .repositories.alunos_repository import AlunoRepository

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
