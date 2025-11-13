# financeiro/conftest.py
import pytest
import decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from usuarios.models import Perfil, Colaborador
from alunos.models import Aluno
from financeiro.models import Produto, Plano

# O get_user_model() pega o seu AUTH_USER_MODEL (usuarios.Usuario)
Usuario = get_user_model()

# -----
# Fixtures de Banco de Dados
# A anotação @pytest.mark.django_db garante o acesso ao DB
# -----

@pytest.fixture
@pytest.mark.django_db
def perfil_admin():
    """Fixture para o perfil de ADMINISTRADOR."""
    return Perfil.objects.create(nome='ADMINISTRADOR')

@pytest.fixture
@pytest.mark.django_db
def perfil_recepcionista():
    """Fixture para o perfil de RECEPCIONISTA."""
    return Perfil.objects.create(nome='RECEPCIONISTA')

@pytest.fixture
@pytest.mark.django_db
def admin_user(perfil_admin):
    """Fixture para um usuário admin completo (Usuario + Colaborador)."""
    user = Usuario.objects.create_user(
        email='admin_pytest@pilates.com',
        password='testpassword123',
        nome_completo='Admin Pytest'
    )
    colab = Colaborador.objects.create(
        usuario=user,
        data_nascimento='2000-01-01'
    )
    colab.perfis.add(perfil_admin)
    return user

@pytest.fixture
@pytest.mark.django_db
def recepcionista_user(perfil_recepcionista):
    """Fixture para um usuário recepcionista completo."""
    user = Usuario.objects.create_user(
        email='recep_pytest@pilates.com',
        password='testpassword123',
        nome_completo='Recep Pytest'
    )
    colab = Colaborador.objects.create(
        usuario=user,
        data_nascimento='2000-01-01'
    )
    colab.perfis.add(perfil_recepcionista)
    return user

@pytest.fixture
@pytest.mark.django_db
def aluno():
    """Fixture para um Aluno."""
    # Assume que Aluno não precisa de um Usuario logado
    return Aluno.objects.create(
        nome_completo='Aluno de Teste Pytest',
        email='aluno_pytest@email.com',
        cpf='98765432101'
    )

@pytest.fixture
@pytest.mark.django_db
def produto():
    """Fixture para um Produto com estoque inicial."""
    return Produto.objects.create(
        nome="Top de Pilates (Pytest)",
        preco=decimal.Decimal('50.00'),
        quantidade_estoque=10
    )

@pytest.fixture
@pytest.mark.django_db
def plano():
    """Fixture para um Plano."""
    return Plano.objects.create(
        nome="Plano Pytest",
        duracao_dias=30,
        creditos_semanais=3,
        preco=decimal.Decimal('200.00')
    )

# -----
# Fixtures de Cliente de API
# -----

@pytest.fixture
def api_client():
    """Cliente de API não autenticado."""
    return APIClient()

@pytest.fixture
def admin_client(api_client, admin_user):
    """Cliente de API autenticado como Administrador."""
    api_client.force_authenticate(user=admin_user)
    return api_client

@pytest.fixture
def recepcionista_client(api_client, recepcionista_user):
    """Cliente de API autenticado como Recepcionista."""
    api_client.force_authenticate(user=recepcionista_user)
    return api_client