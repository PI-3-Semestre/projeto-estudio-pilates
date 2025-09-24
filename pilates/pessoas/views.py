from django.shortcuts import redirect, render
from .models import Aluno
from .forms import AlunoForm

# Create your views here.
def lista_alunos(request):
    alunos = Aluno.objects.all() 
    context = {'alunos': alunos} 
    return render(request, 'pessoas/lista_alunos.html', context)

def cadastrar_aluno(request):
    if request.method == 'POST':
        form = AlunoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('lista_alunos')
    else:
        form = AlunoForm()
    return render(request, 'pessoas/cadastrar_aluno.html', {'form': form})

