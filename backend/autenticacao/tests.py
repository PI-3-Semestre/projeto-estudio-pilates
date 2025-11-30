# autenticacao/tests.py

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from usuarios.models import Usuario, Colaborador, Endereco

class LoginAPITestCase(APITestCase):
    """
    Suite de testes para o endpoint de login.
    """
    def setUp(self):
        # Cria um usuário de teste para os cenários
        self.user = Usuario.objects.create_user(
            username='testuser',
            email='teste@exemplo.com',
            password='senhasecreta123'
        )
        # Cria um endereço e um perfil de colaborador para o usuário
        self.endereco = Endereco.objects.create(logradouro="Rua Teste", numero="123", cidade="Teste")
        self.colaborador = Colaborador.objects.create(
            usuario=self.user,
            endereco=self.endereco
        )

    def test_login_com_credenciais_validas(self):
        """
        Verifica se um usuário consegue fazer login com e-mail e senha corretos.
        """
        url = reverse('token_obtain_pair') # Usa o nome da rota para encontrar a URL
        data = {'username': 'teste@exemplo.com', 'password': 'senhasecreta123'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_login_com_senha_invalida(self):
        """
        Verifica se o login falha com uma senha incorreta.
        """
        url = reverse('token_obtain_pair')
        data = {'username': 'teste@exemplo.com', 'password': 'senhaerrada'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)