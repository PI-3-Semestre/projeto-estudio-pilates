from django import forms
from .models import Aluno

class AlunoForm(forms.ModelForm):
    class Meta:
        model = Aluno
        fields = '__all__'

        widgets = {
                'dataNascimento': forms.DateInput(attrs={'type': 'date'})
                }
