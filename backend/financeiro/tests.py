# backend/financeiro/tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse # Útil para pegar URLs
import decimal

# Importe os seus models
from .models import Produto, Venda, VendaProduto
from alunos.models import Aluno
from usuarios.models import Perfil, Colaborador

# O get_user_model() pega o seu AUTH_USER_MODEL (usuarios.Usuario)
Usuario = get_user_model()

class VendaEstoqueTests(APITestCase):
    """
    Testes automatizados para o fluxo de venda e controle de estoque.
    """

    def setUp(self):
        """
        Configuração inicial que roda ANTES de cada teste.
        Cria os dados mínimos para os testes.
        """
        
        # 1. Criar Perfis (baseado no seu permissions.py)
        self.perfil_admin = Perfil.objects.create(nome='ADMINISTRADOR')
        
        # 2. Criar um Usuário Administrador para os testes
        self.admin_user = Usuario.objects.create_user(
            email='admin_test@pilates.com',
            password='testpassword123',
            nome_completo='Admin de Teste'
        )
        self.admin_colaborador = Colaborador.objects.create(
            usuario=self.admin_user,
            data_nascimento='2000-01-01'
            # Adicione outros campos obrigatórios de Colaborador se houver
        )
        self.admin_colaborador.perfis.add(self.perfil_admin)

        # 3. Criar um Aluno para a venda
        self.aluno = Aluno.objects.create(
            nome_completo='Aluno de Teste',
            email='aluno_teste@email.com',
            cpf='12345678901'
            # Adicione outros campos obrigatórios de Aluno se houver
        )
        
        # 4. Criar o Produto que vamos testar
        self.produto = Produto.objects.create(
            nome="Top de Pilates (Teste)",
            preco=decimal.Decimal('50.00'),
            quantidade_estoque=10  # <-- Nosso estoque inicial
        )

    def test_criar_venda_falha_estoque_insuficiente(self):
        """
        TESTE 1: (Critério de Aceitação 1)
        Verifica se a API retorna 400 se o estoque for insuficiente.
        """
        print("\nExecutando: Teste de Falha (Estoque Insuficiente)")
        
        # Força a autenticação como nosso admin (sem precisar de token!)
        self.client.force_authenticate(user=self.admin_user)
        
        # A URL para criar a venda
        # (O 'venda-list' vem do basename='venda' no seu urls.py)
        url = reverse('venda-list') 
        # Alternativa (se o reverse falhar): url = '/api/financeiro/vendas/'

        # Payload da venda: Tentar comprar 11, mas só temos 10
        payload = {
            "aluno": self.aluno.pk,
            "itens_venda": [
                {
                    "produto": self.produto.pk,
                    "quantidade": 11 
                }
            ]
        }
        
        # Faz a chamada de API (POST)
        response = self.client.post(url, payload, format='json')
        
        # --- Verificações (Assertions) ---
        
        # 1. Verifica se recebemos o erro 400 (Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 2. Verifica se o estoque NÃO mudou
        self.produto.refresh_from_db() # Atualiza o objeto do produto
        self.assertEqual(self.produto.quantidade_estoque, 10)
        
        # 3. (Opcional) Verifica a mensagem de erro
        self.assertIn("Estoque insuficiente", str(response.data))

    def test_criar_venda_sucesso_e_baixar_estoque(self):
        """
        TESTE 2: (Critério de Aceitação 2)
        Verifica se a API cria a venda (201) e baixa o estoque corretamente.
        """
        print("\nExecutando: Teste de Sucesso (Baixa de Estoque)")

        # Loga como admin
        self.client.force_authenticate(user=self.admin_user)
        
        # URL
        url = reverse('venda-list')
        # Alternativa: url = '/api/financeiro/vendas/'
        
        # Payload da venda: Comprar 2 (temos 10)
        payload = {
            "aluno": self.aluno.pk,
            "itens_venda": [
                {
                    "produto": self.produto.pk,
                    "quantidade": 2
                }
            ]
        }
        
        # Faz a chamada de API (POST)
        response = self.client.post(url, payload, format='json')
        
        # --- Verificações (Assertions) ---

        # 1. Verifica se a venda foi criada com sucesso (201 Created)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Verifica se a Venda foi criada no banco
        self.assertEqual(Venda.objects.count(), 1)
        self.assertEqual(VendaProduto.objects.count(), 1)
        
        # 3. VERIFICAÇÃO PRINCIPAL: Checa se o estoque foi baixado (Signal)
        self.produto.refresh_from_db() # Puxa o dado mais recente do DB
        
        # O estoque era 10, vendemos 2, esperamos 8
        self.assertEqual(self.produto.quantidade_estoque, 8)