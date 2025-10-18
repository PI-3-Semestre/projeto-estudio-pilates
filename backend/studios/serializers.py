# studios/serializers.py
from rest_framework import serializers
from .models import Studio

class StudioSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Studio.
    
    Responsável por converter os dados do modelo Studio para JSON (serialização)
    e por validar os dados de entrada ao criar ou atualizar um studio (desserialização).
    """
    class Meta:
        model = Studio
        
        # Define os campos do modelo que serão expostos na API.
        # Listar os campos explicitamente é uma boa prática de segurança.
        fields = ['id', 'nome', 'endereco']
