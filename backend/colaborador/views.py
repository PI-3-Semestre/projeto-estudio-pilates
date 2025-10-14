from rest_framework import generics, permissions
from drf_spectacular.utils import extend_schema
from .models import Colaborador, Cargo, Endereco
from .serializers import ColaboradorSerializer, CargoSerializer, EnderecoSerializer

@extend_schema(tags=['Colaboradores'])
class ColaboradorListCreateView(generics.ListCreateAPIView):
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    permission_classes = [permissions.IsAdminUser]

@extend_schema(tags=['Colaboradores'])
class ColaboradorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    permission_classes = [permissions.IsAdminUser]
    
@extend_schema(tags=['Cargos'])
class CargoListCreateView(generics.ListCreateAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    
@extend_schema(tags=['Cargos'])
class CargoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    