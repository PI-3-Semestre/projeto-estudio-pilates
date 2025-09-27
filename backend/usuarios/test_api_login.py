# backend/usuarios/test_api_login.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

@pytest.mark.django_db
def test_login_com_sucesso():
    User = get_user_model()
    client = APIClient()
    test_user = User.objects.create_user(
        username='teste@email.com',
        email='teste@email.com',
        cpf='12345678901',
        password='senha_super_segura_123'
    )
    
    url = '/api/auth/login/'
    data = {
        'username': 'teste@email.com',
        'password': 'senha_super_segura_123'
    }

    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_login_com_senha_incorreta():
    User = get_user_model()
    client = APIClient()
    User.objects.create_user(
        username='teste@email.com',
        email='teste@email.com',
        cpf='12345678901',
        password='senha_correta'
    )
    
    url = '/api/auth/login/'
    data = {
        'username': 'teste@email.com',
        'password': 'senha_errada'
    }

    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_login_com_usuario_inexistente():
    client = APIClient()
    url = '/api/auth/login/'
    data = {
        'username': 'ninguem@email.com',
        'password': 'qualquer_senha'
    }

    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_acessar_dados_do_usuario_com_token_valido():
    User = get_user_model()
    client = APIClient()
    user = User.objects.create_user(
        username='user@test.com',
        email='user@test.com',
        cpf='11122233344',
        first_name='Teste',
        password='senha_segura'
    )

    login_url = '/api/auth/login/'
    login_data = {'username': 'user@test.com', 'password': 'senha_segura'}
    login_response = client.post(login_url, login_data, format='json')
    
    access_token = login_response.data['access']

    me_url = '/api/auth/me/'
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    me_response = client.get(me_url)

    assert me_response.status_code == status.HTTP_200_OK
    assert me_response.data['email'] == user.email
    assert me_response.data['cpf'] == user.cpf
    assert me_response.data['first_name'] == user.first_name

@pytest.mark.django_db
def test_bloquear_acesso_a_dados_sem_token():
    client = APIClient()
    url = '/api/auth/me/'

    response = client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED