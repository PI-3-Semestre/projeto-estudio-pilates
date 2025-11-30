from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from studios.models import Studio
from usuarios.models import Colaborador, Perfil
from alunos.models import Aluno
from avaliacoes.models import Avaliacao
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AvaliacaoPerformCreateTests(APITestCase):
    def setUp(self):
        self.admin_master_user = User.objects.create_user(username='adminmaster', email='adminmaster@example.com', password='password123', is_superuser=True)
        self.studio1 = Studio.objects.create(nome='Studio A', endereco='Address A')
        self.instrutor_perfil, created = Perfil.objects.get_or_create(nome='INSTRUTOR')
        self.fisioterapeuta_perfil, created = Perfil.objects.get_or_create(nome='FISIOTERAPEUTA')
        from studios.models import FuncaoOperacional
        self.funcao_instrutor, created = FuncaoOperacional.objects.get_or_create(nome='Instrutor de Pilates')

        self.instrutor_user = User.objects.create_user(username='instrutor', email='instrutor@example.com', password='password123')
        self.instrutor_colaborador = Colaborador.objects.create(usuario=self.instrutor_user)
        self.instrutor_colaborador.perfis.add(self.instrutor_perfil)
        self.instrutor_colaborador.unidades.add(self.studio1, through_defaults={'permissao': self.funcao_instrutor})

        self.aluno_user = User.objects.create_user(username='aluno', email='aluno@example.com', password='password123', cpf='12345678901')
        self.aluno = Aluno.objects.create(usuario=self.aluno_user, dataNascimento=timezone.localdate() - timedelta(days=365*20)) # 20 years ago

        self.url = reverse('avaliacao-list-create', kwargs={'aluno_cpf': self.aluno.cpf})

    def test_avaliacao_perform_create_associates_studio_from_request(self):
        self.client.force_authenticate(user=self.instrutor_user)
        data = {
            'data_avaliacao': timezone.localdate().isoformat(),
            'objetivo_aluno': 'Perder peso',
            'studio': self.studio1.pk # Studio provided in request data
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Avaliacao.objects.count(), 1)
        avaliacao = Avaliacao.objects.first()
        self.assertEqual(avaliacao.studio, self.studio1)
        self.assertEqual(avaliacao.instrutor, self.instrutor_colaborador)
        self.assertEqual(avaliacao.aluno, self.aluno)

    def test_avaliacao_perform_create_associates_studio_from_instructor_if_single(self):
        # Remove studio from request data
        self.client.force_authenticate(user=self.instrutor_user)
        data = {
            'data_avaliacao': timezone.localdate().isoformat(),
            'objetivo_aluno': 'Ganhar massa muscular',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Avaliacao.objects.count(), 1) 
        avaliacao = Avaliacao.objects.first()
        self.assertEqual(avaliacao.studio, self.studio1) 
        self.assertEqual(avaliacao.instrutor, self.instrutor_colaborador)
        self.assertEqual(avaliacao.aluno, self.aluno)

    def test_avaliacao_perform_create_no_studio_if_multiple_instructor_studios_and_not_in_request(self):
        studio2 = Studio.objects.create(nome='Studio B', endereco='Address B')
        self.instrutor_colaborador.unidades.add(studio2, through_defaults={'permissao': self.funcao_instrutor})
        self.instrutor_colaborador.save()

        self.client.force_authenticate(user=self.instrutor_user)
        data = {
            'data_avaliacao': timezone.localdate().isoformat(),
            'objetivo_aluno': 'Melhorar flexibilidade',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        avaliacao = Avaliacao.objects.latest('id') 
        self.assertIsNone(avaliacao.studio)