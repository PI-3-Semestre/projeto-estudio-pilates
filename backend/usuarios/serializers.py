# backend/usuarios/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

# Serializer para o processo de login.
# Ele usa o nosso Authentication Backend customizado para validar o usuário.
class LoginSerializer(TokenObtainPairSerializer):
    pass


# Serializer para exibir os dados do usuário de forma segura.
User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Define quais campos do usuário serão retornados na API
        fields = ['id', 'email', 'cpf', 'first_name', 'last_name', 'tipo']