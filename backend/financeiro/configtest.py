# financeiro/conftest.py
import pytest
import decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

# Imports necessários para criar os objetos
from alunos.models import Aluno
from usuarios.models import Perfil, Colaborador
from financeiro.models import Produto, Plano

Usuario = get_user_model()

# -----
# Fixtures para CRIAR usuários
# -----

@pytest.fixture
@pytest.mark.django_db
def admin_user():
    """
    CRIA um usuário Superuser (Admin) para os testes.
    """
    user, _ = Usuario.objects.get_or_create(
        email='admin.pytest@pilates.com',
        defaults={
            'nome_completo': 'Admin de Teste', 
            'is_superuser': True, 
            'is_staff': True
        }
    )
    # Garante que é superuser caso já exista
    user.is_superuser = True
    user.is_staff = True
    user.save()
    return user

@pytest.fixture
@pytest.mark.django_db
def recepcionista_user():
    """
    CRIA um usuário e um Colaborador com perfil de Recepcionista.
    """
    user, _ = Usuario.objects.get_or_create(
        email='recep.pytest@pilates.com',
        defaults={'nome_completo': 'Recepcionista de Teste'}
    )
    
    # Cria o perfil necessário para a lógica de permissão
    perfil, _ = Perfil.objects.get_or_create(nome='RECEPCIONISTA')
    
    # Cria o colaborador e liga-o ao usuário
    colaborador, _ = Colaborador.objects.get_or_create(
        usuario=user,
        defaults={'data_contratacao': '2025-01-01'}
    )
    colaborador.perfis.add(perfil)
    
    return user

@pytest.fixture
@pytest.mark.django_db
def aluno():
    """
    CRIA uma instância de Aluno para os testes.
    """
    # Adiciona campos obrigatórios (ajuste se o teu modelo Aluno for diferente)
    aluno, _ = Aluno.objects.get_or_create(
        email='aluno.pytest@pilates.com',
        defaults={
            'nome_completo': 'Aluno de Teste',
            'data_nascimento': '2000-01-01',
            'ativo': True
        }
    )
    return aluno

# -----
# Fixtures de Cliente de API (Estas estavam corretas)
# -----

@pytest.fixture
def api_client():
    """Cliente de API não autenticado."""
    return APIClient()

@pytest.fixture
def admin_client(api_client, admin_user):
    """Cliente de API autenticado como ADMINISTRADOR."""
    api_client.force_authenticate(user=admin_user)
    return api_client

@pytest.fixture
def recepcionista_client(api_client, recepcionista_user):
    """Cliente de API autenticado como RECEPCIONISTA."""
    api_client.force_authenticate(user=recepcionista_user)
    return api_client

# -----
# Fixtures de Dados (Estas estavam corretas, pois usam get_or_create)
# -----

@pytest.fixture
@pytest.mark.django_db
def produto():
    """
    Cria um produto isolado para os testes financeiros.
    """
    prod, _ = Produto.objects.get_or_create(
        nome="Produto de Teste (Pytest)",
        defaults={
            "preco": decimal.Decimal('75.00'),
            "quantidade_estoque": 20
        }
    )
    # Garante que o estoque está correto para o teste
    prod.quantidade_estoque = 20
    prod.save()
    return prod

@pytest.fixture
@pytest.mark.django_db
def plano():
    """
    Cria um plano isolado para os testes financeiros.
    """
    plano, _ = Plano.objects.get_or_create(
        nome="Plano de Teste (Pytest)",
        defaults={
            "duracao_dias": 30,
            "creditos_semanais": 3,
            "preco": decimal.Decimal('250.00')
        }
    )
    return plano