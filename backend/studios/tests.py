from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from studios.models import Studio
from usuarios.models import Colaborador, Perfil
from alunos.models import Aluno
from financeiro.models import Produto, EstoqueStudio, Matricula, Venda, Pagamento
from avaliacoes.models import Avaliacao
from agendamentos.models import Aula, AulaAluno
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class DashboardStudioViewTests(APITestCase):
    def setUp(self):
        self.admin_master_user = User.objects.create_user(username='adminmaster', email='adminmaster@example.com', password='password123', is_superuser=True)
        self.studio1 = Studio.objects.create(nome='Studio A', endereco='Address A')
        self.studio2 = Studio.objects.create(nome='Studio B', endereco='Address B')

        self.admin_perfil, created = Perfil.objects.get_or_create(nome='ADMINISTRADOR')
        self.instrutor_perfil, created = Perfil.objects.get_or_create(nome='INSTRUTOR')
        from studios.models import FuncaoOperacional
        self.funcao_admin, created = FuncaoOperacional.objects.get_or_create(nome='Administrador de Studio')
        self.funcao_instrutor, created = FuncaoOperacional.objects.get_or_create(nome='Instrutor de Pilates')

        self.admin_studio1_user = User.objects.create_user(username='adminstudio1', email='adminstudio1@example.com', password='password123')
        self.admin_studio1_colaborador = Colaborador.objects.create(usuario=self.admin_studio1_user)
        self.admin_studio1_colaborador.perfis.add(self.admin_perfil)
        self.admin_studio1_colaborador.unidades.add(self.studio1, through_defaults={'permissao': self.funcao_admin})

        self.instrutor_studio1_user = User.objects.create_user(username='instrutorstudio1', email='instrutorstudio1@example.com', password='password123')
        self.instrutor_studio1_colaborador = Colaborador.objects.create(usuario=self.instrutor_studio1_user)
        self.instrutor_studio1_colaborador.perfis.add(self.instrutor_perfil)
        self.instrutor_studio1_colaborador.unidades.add(self.studio1, through_defaults={'permissao': self.funcao_instrutor})
        from agendamentos.models import Modalidade
        self.modalidade = Modalidade.objects.create(nome='Pilates')
        from financeiro.models import Plano
        self.plano = Plano.objects.create(nome='Plano Básico', duracao_dias=30, creditos_semanais=4, preco=100.00)

        self.admin_studio2_user = User.objects.create_user(username='adminstudio2', email='adminstudio2@example.com', password='password123')
        self.admin_studio2_colaborador = Colaborador.objects.create(usuario=self.admin_studio2_user)
        self.admin_studio2_colaborador.perfis.add(self.admin_perfil)
        self.admin_studio2_colaborador.unidades.add(self.studio2, through_defaults={'permissao': self.funcao_admin})

        self.url = lambda pk: reverse('studio-dashboard', kwargs={'studio_pk': pk})

        self.produto1_s1 = Produto.objects.create(nome='Produto 1 S1', preco=10.00)
        EstoqueStudio.objects.create(produto=self.produto1_s1, studio=self.studio1, quantidade=100)
        self.aluno1_s1_user = User.objects.create_user(username='aluno1s1', email='aluno1s1@example.com', password='password123')
        self.aluno1_s1 = Aluno.objects.create(usuario=self.aluno1_s1_user, dataNascimento=timezone.localdate() - timedelta(days=365*20))
        self.matricula1_s1 = Matricula.objects.create(aluno=self.aluno1_s1, plano=self.plano, data_inicio=timezone.localdate(), data_fim=timezone.localdate() + timedelta(days=30), studio=self.studio1)
        self.venda1_s1 = Venda.objects.create(aluno=self.aluno1_s1, studio=self.studio1)
        self.avaliacao1_s1 = Avaliacao.objects.create(aluno=self.aluno1_s1, instrutor=self.instrutor_studio1_colaborador, data_avaliacao=timezone.localdate(), objetivo_aluno='Objective', studio=self.studio1)
        self.aula1_s1 = Aula.objects.create(studio=self.studio1, modalidade=self.modalidade, instrutor_principal=self.instrutor_studio1_colaborador, data_hora_inicio=timezone.now(), duracao_minutos=60)
        self.agendamento1_s1 = AulaAluno.objects.create(aluno=self.aluno1_s1, aula=self.aula1_s1, status_presenca=AulaAluno.StatusPresenca.AGENDADO)
        self.pagamento1_s1 = Pagamento.objects.create(matricula=self.matricula1_s1, valor_total=100.00, status='PENDENTE', data_vencimento=timezone.localdate() + timedelta(days=5))
        self.pagamento2_s1 = Pagamento.objects.create(matricula=self.matricula1_s1, valor_total=50.00, status='ATRASADO', data_vencimento=timezone.localdate() - timedelta(days=5))

        self.aluno1_s2_user = User.objects.create_user(username='aluno1s2', email='aluno1s2@example.com', password='password123')
        self.aluno1_s2 = Aluno.objects.create(usuario=self.aluno1_s2_user, dataNascimento=timezone.localdate() - timedelta(days=365*20))
        self.matricula1_s2 = Matricula.objects.create(aluno=self.aluno1_s2, plano=self.plano, data_inicio=timezone.localdate(), data_fim=timezone.localdate() + timedelta(days=30), studio=self.studio2)
        self.pagamento1_s2 = Pagamento.objects.create(matricula=self.matricula1_s2, valor_total=100.00, status='PAGO', data_vencimento=timezone.localdate() - timedelta(days=5))


    def test_admin_master_can_access_any_studio_dashboard(self):
        self.client.force_authenticate(user=self.admin_master_user)
        response = self.client.get(self.url(self.studio1.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['studio_id'], self.studio1.pk)

        response = self.client.get(self.url(self.studio2.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['studio_id'], self.studio2.pk)

    def test_studio_admin_can_access_own_studio_dashboard(self):
        self.client.force_authenticate(user=self.admin_studio1_user)
        response = self.client.get(self.url(self.studio1.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['studio_id'], self.studio1.pk)

    def test_studio_admin_cannot_access_other_studio_dashboard(self):
        self.client.force_authenticate(user=self.admin_studio1_user)
        response = self.client.get(self.url(self.studio2.pk))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_users_cannot_access_dashboard(self):
        self.client.force_authenticate(user=self.instrutor_studio1_user)
        response = self.client.get(self.url(self.studio1.pk))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_users_cannot_access_dashboard(self):
        response = self.client.get(self.url(self.studio1.pk))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_data_aggregation(self):
        self.client.force_authenticate(user=self.admin_master_user)
        response = self.client.get(self.url(self.studio1.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(response.data['financeiro']['total_matriculas'], 1)
        self.assertEqual(response.data['financeiro']['total_vendas'], 1)
        self.assertEqual(response.data['financeiro']['total_pagamentos_pendentes'], 1)
        self.assertEqual(response.data['financeiro']['total_pagamentos_atrasados'], 1)
        self.assertEqual(response.data['avaliacoes']['total_avaliacoes'], 1)
        self.assertEqual(response.data['agendamentos']['total_agendamentos_hoje'], 1)
        self.assertEqual(response.data['agendamentos']['total_agendamentos_pendentes'], 1)

        response = self.client.get(self.url(self.studio2.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['financeiro']['total_matriculas'], 1)
        self.assertEqual(response.data['financeiro']['total_vendas'], 0) # No sales for studio 2
        self.assertEqual(response.data['financeiro']['total_pagamentos_pendentes'], 0)
        self.assertEqual(response.data['financeiro']['total_pagamentos_atrasados'], 0)
        self.assertEqual(response.data['avaliacoes']['total_avaliacoes'], 0)
        self.assertEqual(response.data['agendamentos']['total_agendamentos_hoje'], 0)
        self.assertEqual(response.data['agendamentos']['total_agendamentos_pendentes'], 0)