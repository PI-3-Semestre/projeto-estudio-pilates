# financeiro/test_serializers.py
import pytest
from rest_framework.exceptions import ValidationError
from financeiro.serializers import VendaSerializer, VendaProdutoInputSerializer, PagamentoSerializer

pytestmark = pytest.mark.django_db

def test_venda_serializer_validate_sem_itens(aluno):
    """Testa se a validação falha se 'itens_venda' estiver vazio."""
    data = {
        "aluno": aluno.pk,
        "itens_venda": []
    }
    
    serializer = VendaSerializer(data=data)
    
    # Verifica se 'is_valid()' levanta uma exceção
    with pytest.raises(ValidationError) as e:
        serializer.is_valid(raise_exception=True)
    
    assert "A venda deve conter pelo menos um produto" in str(e.value)

def test_venda_serializer_validate_estoque_insuficiente(aluno, produto):
    """Testa a validação de estoque do serializer (duplicado do teste de integração)."""
    # Produto fixture tem 10
    data = {
        "aluno": aluno.pk,
        "itens_venda": [
            {"produto": produto.pk, "quantidade": 11}
        ]
    }
    serializer = VendaSerializer(data=data)
    
    with pytest.raises(ValidationError) as e:
        serializer.is_valid(raise_exception=True)
    
    assert "Estoque insuficiente" in str(e.value)

def test_pagamento_serializer_validate_ambos_links(aluno, plano):
    """Testa se o PagamentoSerializer falha se 'matricula' e 'venda' forem passados."""
    # Simula a criação de uma matricula e venda
    matricula = plano.matriculas.create(
        aluno=aluno, data_inicio='2025-01-01', data_fim='2025-02-01', valor_pago=100
    )
    venda = Venda.objects.create(aluno=aluno)
    
    data = {
        "matricula_id": matricula.pk,
        "venda_id": venda.pk,
        "valor_total": 100,
        "metodo_pagamento": "PIX",
        "data_vencimento": "2025-01-10"
    }
    
    serializer = PagamentoSerializer(data=data)
    
    with pytest.raises(ValidationError) as e:
        serializer.is_valid(raise_exception=True)
        
    assert "não pode estar associado a uma matrícula e a uma venda" in str(e.value)

def test_pagamento_serializer_validate_nenhum_link():
    """Testa se o PagamentoSerializer falha se nem 'matricula' nem 'venda' forem passados."""
    data = {
        "valor_total": 100,
        "metodo_pagamento": "PIX",
        "data_vencimento": "2025-01-10"
    }
    
    serializer = PagamentoSerializer(data=data)
    
    with pytest.raises(ValidationError) as e:
        serializer.is_valid(raise_exception=True)
        
    assert "associado a uma matrícula ou a uma venda" in str(e.value)