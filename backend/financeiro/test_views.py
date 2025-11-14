# financeiro/test_views.py
import pytest
from django.urls import reverse
from rest_framework import status
from financeiro.models import Matricula # <-- Import Absoluto

pytestmark = pytest.mark.django_db

def test_plano_list_admin(admin_client, plano):
    """Admin (Fernando) pode listar planos."""
    url = reverse('plano-list')
    response = admin_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    
    # Verifica se o plano de teste está na lista
    nomes_planos = [p['nome'] for p in response.data]
    assert plano.nome in nomes_planos

def test_plano_list_recepcionista_proibido(recepcionista_client):
    """Recepcionista (Mariana) não pode listar planos."""
    url = reverse('plano-list')
    response = recepcionista_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_matricula_get_serializer_class_list(admin_client, aluno, plano):
    """Testa se a action 'list' da MatriculaViewSet usa o MatriculaReadSerializer."""
    
    matricula, _ = Matricula.objects.get_or_create(
        aluno=aluno,
        plano=plano,
        defaults={
            "data_inicio":'2025-01-01',
            "data_fim":'2025-02-01',
            "valor_pago":200
        }
    )
    
    url = reverse('matricula-list')
    response = admin_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    
    # Encontra a matricula de teste na resposta
    data = next((m for m in response.data if m['id'] == matricula.id), None)
    assert data is not None
    
    # O ReadSerializer aninha 'aluno' e 'plano' como objetos
    assert isinstance(data['aluno'], dict)
    assert isinstance(data['plano'], dict)
    assert data['plano']['nome'] == plano.nome

def test_pagamento_list_recepcionista(recepcionista_client):
    """Testa se Recepcionista (Mariana) pode listar pagamentos (SAFE_METHOD)."""
    url = reverse('pagamento-list')
    response = recepcionista_client.get(url)
    assert response.status_code == status.HTTP_200_OK