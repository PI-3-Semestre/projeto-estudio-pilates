from rest_framework import generics
from .models import Colaborador, Cargo, Endereco
from .serializers import ColaboradorSerializer, CargoSerializer, EnderecoSerializer

class ColaboradorListCreateView(generics.ListCreateAPIView):
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer

class ColaboradorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Colaborador.objects.all()
    serializer_class = ColaboradorSerializer
    
class CargoListCreateView(generics.ListCreateAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    
class CargoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    