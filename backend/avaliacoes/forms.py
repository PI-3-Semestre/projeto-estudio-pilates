from avaliacoes.models import Avaliacao
from django import forms
 

class AvaliacaoInicialForm(forms.ModelForm):
    class Meta:
        model = Avaliacao
        # Excluímos o campo 'aluno', vamo associá-lo manualmente na view
        exclude = ['aluno'] 
        widgets = {
            # Adiciona um seletor de data para os campos de data
            'data_avaliacao': forms.DateInput(attrs={'type': 'date'}),
            'data_reavaliacao': forms.DateInput(attrs={'type': 'date'}),
            }