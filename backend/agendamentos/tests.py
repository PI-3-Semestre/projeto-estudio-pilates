# agendamentos/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from usuarios.models import User, Perfil, Colaborador
from .models import Aula, Modalidade

class AulaPermissionsAPITestCase(APITestCase):
    
    def setUp(self):
        """
        Configura o ambiente de teste: cria perfis, usuários, colaboradores e aulas.
        Este método roda antes de cada teste.
        """
        # Criar Perfis
        self.perfil_instrutor = Perfil.objects.create(nome='INSTRUTOR')
        self.perfil_admin = Perfil.objects.create(nome='ADMINISTRADOR')

        # Criar Usuário Instrutor 1
        self.instrutor_user_1 = User.objects.create_user(username='instrutor1', password='password123')
        self.colaborador_1 = Colaborador.objects.create(user=self.instrutor_user_1)
        self.colaborador_1.perfis.add(self.perfil_instrutor)

        # Criar Usuário Instrutor 2
        self.instrutor_user_2 = User.objects.create_user(username='instrutor2', password='password123')
        self.colaborador_2 = Colaborador.objects.create(user=self.instrutor_user_2)
        self.colaborador_2.perfis.add(self.perfil_instrutor)
        
        # Criar uma Modalidade
        self.modalidade = Modalidade.objects.create(nome='Pilates')

        # Criar uma aula que pertence ao Instrutor 1
        self.aula_instrutor_1 = Aula.objects.create(
            instrutor_principal=self.colaborador_1,
            modalidade=self.modalidade,
            # ... outros campos necessários para a aula
        )

    def test_instrutor_pode_editar_propria_aula(self):
        """
        Garante que um instrutor consegue fazer um PUT/PATCH na sua própria aula.
        """
        # Força a autenticação como o instrutor dono da aula
        self.client.force_authenticate(user=self.instrutor_user_1)
        
        url = reverse('aula-detail', kwargs={'pk': self.aula_instrutor_1.pk})
        data = {'nome': 'Aula de Pilates Atualizada'} # Dados para atualizar
        
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_instrutor_nao_pode_editar_aula_de_outro(self):
        """
        Garante que um instrutor recebe 403 Forbidden ao tentar editar aula de outro.
        """
        # Força a autenticação como o Instrutor 2
        self.client.force_authenticate(user=self.instrutor_user_2)
        
        url = reverse('aula-detail', kwargs={'pk': self.aula_instrutor_1.pk})
        data = {'nome': 'Tentativa de Invasão'}
        
        response = self.client.patch(url, data)
        
        # O resultado esperado é um erro de permissão!
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)