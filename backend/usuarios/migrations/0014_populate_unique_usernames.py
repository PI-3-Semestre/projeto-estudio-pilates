from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import migrations, models

def populate_usernames(apps, schema_editor):
    """
    Pega cada usuário existente e define seu username a partir do seu email.
    Como os emails já são únicos, os usernames também serão.
    """
    Usuario = apps.get_model('usuarios', 'Usuario')
    for user in Usuario.objects.all():
        user.username = user.email
        user.save(update_fields=['username'])

class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0013_alter_usuario_email_unique'),
    ]

    operations = [
        # Passo 1: Adiciona o campo 'username', mas permite que ele seja nulo temporariamente.
        migrations.AddField(
            model_name='usuario',
            name='username',
            field=models.CharField(
                error_messages={'unique': 'A user with that username already exists.'},
                help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.',
                max_length=150,
                unique=True,
                validators=[UnicodeUsernameValidator()],
                verbose_name='username',
                null=True  # Permite nulos temporariamente
            ),
        ),
        # Passo 2: Executa a função para popular os usernames que estão nulos.
        migrations.RunPython(populate_usernames, reverse_code=migrations.RunPython.noop),
        
        # Passo 3: Altera o campo para que ele não seja mais nulo, tornando-o obrigatório.
        migrations.AlterField(
            model_name='usuario',
            name='username',
            field=models.CharField(
                error_messages={'unique': 'A user with that username already exists.'},
                help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.',
                max_length=150,
                unique=True,
                validators=[UnicodeUsernameValidator()],
                verbose_name='username'
            ),
        ),
    ]