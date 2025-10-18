from django.db import migrations

def populate_perfis(apps, schema_editor):
    Perfil = apps.get_model('usuarios', 'Perfil')
    perfis = [
        'ADMIN_MASTER',
        'ADMINISTRADOR',
        'RECEPCIONISTA',
        'FISIOTERAPEUTA',
        'INSTRUTOR',
    ]
    for nome_perfil in perfis:
        Perfil.objects.get_or_create(nome=nome_perfil)

class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0003_perfil_remove_colaborador_perfil_colaborador_perfis'),
    ]

    operations = [
        migrations.RunPython(populate_perfis),
    ]
