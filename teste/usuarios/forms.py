# usuarios/forms.py

# 1. Imports necessários
from django import forms
from .models import Aluno
from email_validator import validate_email, EmailNotValidError

# 2. Definição do Formulário
class AlunoForm(forms.ModelForm):
    class Meta:
        model = Aluno
        fields = '__all__'  # Inclui todos os campos do model Aluno no formulário
        widgets = {
            # Define que o campo de data deve usar um widget de calendário no HTML
            'dataNascimento': forms.DateInput(attrs={'type': 'date'}),
        }

    # 3. Método de Validação Customizada para o campo 'email'
    def clean_email(self):
        """
        Este método é chamado automaticamente pelo Django quando
        form.is_valid() é executado na view.
        """
        # Pega o valor do e-mail que o usuário digitou
        email = self.cleaned_data.get('email')

        # Se o campo for opcional e estiver vazio, não faz nada
        if not email:
            return email
        
        # Tenta validar o e-mail usando a biblioteca externa
        try:
            # A opção check_deliverability=True verifica se o domínio do e-mail existe (DNS).
            valid = validate_email(email, check_deliverability=True)
            
            # Se a validação for um sucesso, retorna o e-mail normalizado.
            # O formulário continua seu processo de validação.
            return valid.email

        # Se a biblioteca levantar um erro (e-mail inválido)...
        except EmailNotValidError as e:
            # ...nós capturamos esse erro e levantamos um ValidationError do Django.
            # É ESTA LINHA que informa ao Django que o campo é INVÁLIDO.
            # A mensagem de erro 'e' será exibida no template.
            raise forms.ValidationError(str(e))
