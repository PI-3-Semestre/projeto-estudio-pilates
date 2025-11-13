# financeiro/test_integration_venda.py
import pytest
from rest_framework import status
from django.urls import reverse
from financeiro.models import Produto, Venda, VendaProduto

# A marcação @pytest.mark.django_db é necessária para testes que acessam o DB
pytestmark = pytest.mark.django_db

def test_criar_venda_falha_estoque_insuficiente(admin_client, aluno, produto):
    """
    TESTE 1: (Critério de Aceitação 1)
    Verifica se a API retorna 400 se o estoque for insuficiente.
    """
    print("\nExecutando: Teste de Falha (Estoque Insuficiente)")
    
    # O 'produto' fixture começa com 10 em estoque
    url = reverse('venda-list') 

    # Payload da venda: Tentar comprar 11
    payload = {
        "aluno": aluno.pk,
        "itens_venda": [
            {
                "produto": produto.pk,
                "quantidade": 11 
            }
        ]
    }
    
    response = admin_client.post(url, payload, format='json')
    
    # --- Verificações (Assertions) ---
    
    # 1. Verifica se recebemos o erro 400 (Bad Request)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    # 2. Verifica se o estoque NÃO mudou
    produto.refresh_from_db() # Atualiza o objeto do produto
    assert produto.quantidade_estoque == 10
    
    # 3. (Opcional) Verifica a mensagem de erro
    assert "Estoque insuficiente" in str(response.data)

def test_criar_venda_sucesso_e_baixar_estoque(admin_client, aluno, produto):
    """
    TESTE 2: (Critério de Aceitação 2)
    Verifica se a API cria a venda (201) e baixa o estoque corretamente (via Signal).
    """
    print("\nExecutando: Teste de Sucesso (Baixa de Estoque)")
    
    # O 'produto' fixture começa com 10 em estoque
    url = reverse('venda-list')
    
    # Payload da venda: Comprar 2
    payload = {
        "aluno": aluno.pk,
        "itens_venda": [
            {
                "produto": produto.pk,
                "quantidade": 2
            }
        ]
    }
    
    response = admin_client.post(url, payload, format='json')
    
    # --- Verificações (Assertions) ---

    # 1. Verifica se a venda foi criada com sucesso (201 Created)
    assert response.status_code == status.HTTP_201_CREATED
    
    # 2. Verifica se a Venda foi criada no banco
    assert Venda.objects.count() == 1
    assert VendaProduto.objects.count() == 1
    
    # 3. VERIFICAÇÃO PRINCIPAL: Checa se o estoque foi baixado (Signal)
    produto.refresh_from_db() # Puxa o dado mais recente do DB
    
    # O estoque era 10, vendemos 2, esperamos 8
    assert produto.quantidade_estoque == 8