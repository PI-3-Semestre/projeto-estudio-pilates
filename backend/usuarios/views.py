# backend/usuarios/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializer, UserSerializer # Adicione UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated # Importe a permissão

# --- Mantenha esta classe que já criamos ---
class LoginView(TokenObtainPairView):
    """
    View de login que aceita 'identifier' (cpf ou email) e 'password'.
    """
    serializer_class = LoginSerializer


# --- Adicione esta nova classe ---
class CurrentUserView(APIView):
    """
    View que retorna os dados do usuário atualmente autenticado.
    """
    # Esta linha é a mágica: ela bloqueia o acesso a usuários não autenticados
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Este método é chamado para requisições GET.
        Ele pega o usuário associado ao token e o serializa.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)