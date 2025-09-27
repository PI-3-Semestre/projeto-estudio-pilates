# backend/usuarios/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

# --- Este é o nosso novo e simplificado LoginSerializer ---
# Ele usa o Authentication Backend customizado que criamos para
# entender que o campo 'username' pode ser um CPF ou um e-mail.
class LoginSerializer(TokenObtainPairSerializer):
    pass


# --- Mantenha o UserSerializer que já existe ---
User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir dados seguros do usuário logado.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'cpf', 'first_name', 'last_name']