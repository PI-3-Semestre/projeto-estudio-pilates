# usuarios/views.py
from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema
from .models import Usuario, Colaborador
from .serializers import UsuarioSerializer, ColaboradorSerializer

@extend_schema(tags=['Contas de Usuário'])
class UsuarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Usuario.objects.all().order_by('-date_joined')
    serializer_class = UsuarioSerializer
    # Apenas administradores podem gerenciar usuários
    permission_classes = [permissions.IsAdminUser]

@extend_schema(tags=['Colaboradores'])
class ColaboradorViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows collaborators to be viewed or edited.
    """
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    lookup_field = 'cpf'  # Usa o CPF para buscar em vez do ID
    # Apenas administradores podem gerenciar colaboradores
    permission_classes = [permissions.IsAdminUser]