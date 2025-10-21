from django.db import migrations

def delete_anonymous_user(apps, schema_editor):
    Usuario = apps.get_model('usuarios', 'Usuario')
    Usuario.objects.filter(cpf='AnonymousUser').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0010_auto_20251021_0158'),
    ]

    operations = [
        migrations.RunPython(delete_anonymous_user),
    ]