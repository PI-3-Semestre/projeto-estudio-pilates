from django.db import migrations

def delete_problematic_users(apps, schema_editor):
    Usuario = apps.get_model('usuarios', 'Usuario')
    Usuario.objects.filter(id__in=[1, 8]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0009_auto_20251021_0121'),
    ]

    operations = [
        migrations.RunPython(delete_problematic_users),
    ]