# financeiro/test_views.py
import pytest
from django.urls import reverse
from rest_framework import status
from financeiro.models import Matricula

pytestmark = pytest.mark.django_db

def test_plano_list_admin(admin_client, plano):
    """Admin pode listar planos."""
    url = reverse('plano-list')
    response = admin_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) > 0
    assert response.data[0]['nome'] == plano.nome

def test_plano_list_recepcionista_proibido(recepcionista_client):
    """Recepcionista não pode listar planos (baseado na IsAdminFinanceiro)."""
    url = reverse('plano-list')
    response = recepcionista_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_matricula_get_serializer_class_list(admin_client, aluno, plano):
    """Testa se a action 'list' da MatriculaViewSet usa o MatriculaReadSerializer."""
    
    Matricula.objects.create(
        aluno=aluno,
        plano=plano,
        data_inicio='2025-01-01',
        data_fim='2025-02-01',
        valor_pago=200
    )
    
    url = reverse('matricula-list')
    response = admin_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    
    # O ReadSerializer aninha 'aluno' e 'plano' como objetos
    data = response.data[0]
    assert isinstance(data['aluno'], dict)
    assert isinstance(data['plano'], dict)
    assert data['aluno']['nome_completo'] == aluno.nome_completo
    assert data['plano']['nome'] == plano.nome

def test_pagamento_list_recepcionista(recepcionista_client):
    """Testa se Recepcionista pode listar pagamentos (SAFE_METHOD)."""
    url = reverse('pagamento-list')
    response = recepcionista_client.get(url)
    assert response.status_code == status.HTTP_200_OK