from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from studios.models import Studio
from usuarios.models import Colaborador, Perfil
from financeiro.models import Plano, Matricula, Produto, EstoqueStudio, Venda, VendaProduto
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class FinanceiroPerformCreateTests(APITestCase):
    def setUp(self):
        self.admin_master_user = User.objects.create_user(username='adminmaster', email='adminmaster@example.com', password='password123', is_superuser=True)
        self.studio1 = Studio.objects.create(nome='Studio A', endereco='Address A')
        self.admin_perfil, created = Perfil.objects.get_or_create(nome='ADMINISTRADOR')
        from studios.models import FuncaoOperacional
        self.funcao_admin, created = FuncaoOperacional.objects.get_or_create(nome='Administrador de Studio')
        self.admin_studio1_user = User.objects.create_user(username='adminstudio1', email='adminstudio1@example.com', password='password123')
        self.admin_studio1_colaborador = Colaborador.objects.create(usuario=self.admin_studio1_user)
        self.admin_studio1_colaborador.perfis.add(self.admin_perfil)
        self.admin_studio1_colaborador.unidades.add(self.studio1, through_defaults={'permissao': self.funcao_admin})

        self.plano = Plano.objects.create(nome='Plano Teste', duracao_dias=30, creditos_semanais=4, preco=100.00)
        self.aluno_user = User.objects.create_user(username='aluno', email='aluno@example.com', password='password123')
        
        self.produto = Produto.objects.create(nome='Produto Teste', preco=50.00)
        EstoqueStudio.objects.create(produto=self.produto, studio=self.studio1, quantidade=10)

        self.matricula_url = reverse('matricula-list')
        self.venda_url = reverse('venda-list')

    def test_matricula_perform_create_associates_studio(self):
        self.client.force_authenticate(user=self.admin_studio1_user)
        data = {
            'aluno_id': self.aluno_user.pk,
            'plano_id': self.plano.pk,
            'data_inicio': timezone.localdate().isoformat(),
            'data_fim': (timezone.localdate() + timedelta(days=30)).isoformat(),
            'studio': self.studio1.pk # Studio should be passed in serializer
        }
        response = self.client.post(self.matricula_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Matricula.objects.count(), 1)
        matricula = Matricula.objects.first()
        self.assertEqual(matricula.studio, self.studio1)

    def test_venda_perform_create_associates_studio_and_deducts_stock(self):
        self.client.force_authenticate(user=self.admin_studio1_user)
        data = {
            'aluno': self.aluno_user.pk,
            'studio': self.studio1.pk,
            'produtos': [ 
                {'produto': self.produto.pk, 'quantidade': 2, 'preco_unitario': self.produto.preco}
            ]
        }
        
        response = self.client.post(self.venda_url, {'aluno': self.aluno_user.pk, 'studio': self.studio1.pk}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        venda = Venda.objects.first()
        self.assertEqual(venda.studio, self.studio1)

        VendaProduto.objects.create(venda=venda, produto=self.produto, quantidade=2, preco_unitario=self.produto.preco)
        
        
        estoque = EstoqueStudio.objects.get(produto=self.produto, studio=self.studio1)
        self.assertEqual(estoque.quantidade, 8) # 10 - 2

    def test_venda_perform_create_insufficient_stock(self):
        self.client.force_authenticate(user=self.admin_studio1_user)
        data = {
            'aluno': self.aluno_user.pk,
            'studio': self.studio1.pk,
        }
        response = self.client.post(self.venda_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        venda = Venda.objects.first()
        
        VendaProduto.objects.create(venda=venda, produto=self.produto, quantidade=15, preco_unitario=self.produto.preco)
        
        estoque = EstoqueStudio.objects.get(produto=self.produto, studio=self.studio1)
        self.assertEqual(estoque.quantidade, 10) 