# backend/usuarios/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializer, UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)