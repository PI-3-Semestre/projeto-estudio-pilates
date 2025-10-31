# agendamentos/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from usuarios.models import Perfil, Colaborador
from .models import Aula, Modalidade
from datetime import datetime

class AulaPermissionsAPITestCase(APITestCase):
    
    @classmethod
    def setUpTestData(cls):
        """
        Roda uma vez no início do teste para configurar o ambiente.
        Criamos todos os perfis, usuários e objetos necessários aqui.
        """
        # --- 1. CRIAR PERFIS ---
        cls.perfil_instrutor = Perfil.objects.create(nome='INSTRUTOR')
        cls.perfil_admin = Perfil.objects.create(nome='ADMINISTRADOR')
        cls.perfil_recepcionista = Perfil.objects.create(nome='RECEPCIONISTA')

        # --- 2. CRIAR USUÁRIOS E COLABORADORES (baseado na sua lista) ---

        # Usuário Instrutor 1 (Dono da Aula)
        cls.user_instrutor_1 = User.objects.create_user(username='ana.silva@pilates.com', email='ana.silva@pilates.com', password='123456')
        cls.colab_instrutor_1 = Colaborador.objects.create(user=cls.user_instrutor_1, nome_completo='Ana Silva')
        cls.colab_instrutor_1.perfis.add(cls.perfil_instrutor)

        # Usuário Instrutor 2 (Para testar acesso negado)
        cls.user_instrutor_2 = User.objects.create_user(username='carla.souza@pilates.com', email='carla.souza@pilates.com', password='123456')
        cls.colab_instrutor_2 = Colaborador.objects.create(user=cls.user_instrutor_2, nome_completo='Carla Souza')
        cls.colab_instrutor_2.perfis.add(cls.perfil_instrutor)

        # Usuário Administrador
        cls.user_admin = User.objects.create_user(username='fernando.alves@pilates.com', email='fernando.alves@pilates.com', password='123456')
        cls.colab_admin = Colaborador.objects.create(user=cls.user_admin, nome_completo='Fernando Alves')
        cls.colab_admin.perfis.add(cls.perfil_admin)

        # Usuário Recepcionista
        cls.user_recepcionista = User.objects.create_user(username='mariana.costa@pilates.com', email='mariana.costa@pilates.com', password='123456')
        cls.colab_recepcionista = Colaborador.objects.create(user=cls.user_recepcionista, nome_completo='Mariana Costa')
        cls.colab_recepcionista.perfis.add(cls.perfil_recepcionista)
        
        # --- 3. CRIAR OBJETOS PARA OS TESTES ---
        cls.modalidade = Modalidade.objects.create(nome='Pilates Teste', duracao_minutos=60)
        
        # Aula que pertence ao Instrutor 1 (Ana Silva)
        cls.aula = Aula.objects.create(
            modalidade=cls.modalidade,
            instrutor_principal=cls.colab_instrutor_1,
            data_hora_inicio=datetime.now(),
            max_alunos=5
        )

        # URLs que serão usadas repetidamente
        cls.url_lista = reverse('aula-list') # URL para listar e criar aulas
        cls.url_detalhe = reverse('aula-detail', kwargs={'pk': cls.aula.pk}) # URL para ver, editar e deletar a aula

    # --- TESTES DE PERMISSÃO PARA INSTRUTOR ---

    def test_instrutor_pode_editar_propria_aula(self):
        """Garante que um instrutor consegue fazer PATCH na sua própria aula."""
        self.client.force_authenticate(user=self.user_instrutor_1)
        response = self.client.patch(self.url_detalhe, {'max_alunos': 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_instrutor_nao_pode_editar_aula_de_outro(self):
        """Garante que um instrutor recebe 403 Forbidden ao tentar editar aula de outro."""
        self.client.force_authenticate(user=self.user_instrutor_2)
        response = self.client.patch(self.url_detalhe, {'max_alunos': 10})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_instrutor_nao_pode_criar_aula(self):
        """Garante que um instrutor recebe 403 Forbidden ao tentar criar uma aula."""
        self.client.force_authenticate(user=self.user_instrutor_1)
        data = { 'modalidade': self.modalidade.pk, 'instrutor_principal': self.colab_instrutor_1.pk, 'data_hora_inicio': datetime.now(), 'max_alunos': 5 }
        response = self.client.post(self.url_lista, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_instrutor_nao_pode_deletar_aula(self):
        """Garante que um instrutor recebe 403 Forbidden ao tentar deletar uma aula."""
        self.client.force_authenticate(user=self.user_instrutor_1)
        response = self.client.delete(self.url_detalhe)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- TESTES DE PERMISSÃO PARA RECEPCIONISTA ---

    def test_recepcionista_pode_editar_qualquer_aula(self):
        """Garante que a recepcionista pode editar uma aula que não é sua."""
        self.client.force_authenticate(user=self.user_recepcionista)
        response = self.client.patch(self.url_detalhe, {'max_alunos': 8})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_recepcionista_nao_pode_criar_aula(self):
        """Garante que a recepcionista é bloqueada ao tentar criar uma aula."""
        self.client.force_authenticate(user=self.user_recepcionista)
        data = { 'modalidade': self.modalidade.pk, 'instrutor_principal': self.colab_instrutor_1.pk, 'data_hora_inicio': datetime.now(), 'max_alunos': 5 }
        response = self.client.post(self.url_lista, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcionista_nao_pode_deletar_aula(self):
        """Garante que a recepcionista é bloqueada ao tentar deletar uma aula."""
        self.client.force_authenticate(user=self.user_recepcionista)
        response = self.client.delete(self.url_detalhe)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- TESTES DE PERMISSÃO PARA ADMINISTRADOR ---
    
    def test_admin_pode_criar_aula(self):
        """Garante que o administrador pode criar uma aula."""
        self.client.force_authenticate(user=self.user_admin)
        data = { 'modalidade': self.modalidade.pk, 'instrutor_principal': self.colab_instrutor_1.pk, 'data_hora_inicio': datetime.now(), 'max_alunos': 5 }
        response = self.client.post(self.url_lista, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_pode_deletar_aula(self):
        """Garante que o administrador pode deletar uma aula."""
        self.client.force_authenticate(user=self.user_admin)
        response = self.client.delete(self.url_detalhe)
        # Após o delete, o status esperado pode ser 204 No Content
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)