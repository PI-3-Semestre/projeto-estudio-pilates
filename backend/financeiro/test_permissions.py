# financeiro/test_permissions.py
import pytest
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory
from financeiro.permissions import IsAdminFinanceiro, CanManagePagamentos

# A fábrica de requests nos ajuda a criar objetos 'request' falsos
factory = APIRequestFactory()

pytestmark = pytest.mark.django_db

# --- Testes para IsAdminFinanceiro ---

def test_is_admin_financeiro_admin(admin_user):
    """Testa se o admin tem permissão."""
    permission = IsAdminFinanceiro()
    request = factory.get('/')
    request.user = admin_user
    
    assert permission.has_permission(request, view=None) == True

def test_is_admin_financeiro_recepcionista(recepcionista_user):
    """Testa se o recepcionista NÃO tem permissão."""
    permission = IsAdminFinanceiro()
    request = factory.get('/')
    request.user = recepcionista_user
    
    assert permission.has_permission(request, view=None) == False

def test_is_admin_financeiro_sem_colaborador(admin_user):
    """Testa se um usuário sem 'colaborador' ligado é bloqueado."""
    admin_user.colaborador.delete() # Remove o link
    
    permission = IsAdminFinanceiro()
    request = factory.get('/')
    request.user = admin_user
    
    assert permission.has_permission(request, view=None) == False

# --- Testes para CanManagePagamentos ---

@pytest.mark.parametrize("method", ["GET", "POST", "PUT", "DELETE"])
def test_can_manage_pagamentos_admin(admin_user, method):
    """Admin pode fazer tudo em Pagamentos."""
    permission = CanManagePagamentos()
    request = factory.request(method=method, path='/')
    request.user = admin_user
    
    assert permission.has_permission(request, view=None) == True

@pytest.mark.parametrize("method, expected", [
    ("GET", True),
    ("POST", True),
    ("PUT", False),
    ("DELETE", False),
])
def test_can_manage_pagamentos_recepcionista(recepcionista_user, method, expected):
    """Recepcionista pode ler (GET) e criar (POST), mas não atualizar ou deletar."""
    permission = CanManagePagamentos()
    request = factory.request(method=method, path='/')
    request.user = recepcionista_user
    
    assert permission.has_permission(request, view=None) == expected