# usuarios/forms.py

# 1. Imports necessários
from django import forms
from .models import Aluno
from email_validator import validate_email, EmailNotValidError

# 2. Definição do Formulário
class AlunoForm(forms.ModelForm):
    class Meta:
        model = Aluno
        fields = '__all__' 
        widgets = {
            'dataNascimento': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean_email(self):
        """
        Este método é chamado automaticamente pelo Django quando
        form.is_valid() é executado na view.
        """
        email = self.cleaned_data.get('email')

        if not email:
            return email
        
        try:
            valid = validate_email(email, check_deliverability=True)
            return valid.email
        except EmailNotValidError as e:
            raise forms.ValidationError(str(e))
