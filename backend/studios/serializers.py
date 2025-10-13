# studios/serializers.py
from rest_framework import serializers
from .models import Studio

class StudioSerializer(serializers.ModelSerializer):
    """ Serializer para listar e detalhar informações básicas de um Studio. """
    class Meta:
        model = Studio
        fields = ['id', 'nome', 'endereco']