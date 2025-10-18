# usuarios/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, ColaboradorViewSet

# DefaultRouter é uma ferramenta do Django Rest Framework que cria automaticamente
# as URLs para um ViewSet.
router = DefaultRouter()

# Registra o ViewSet de usuários com o prefixo de URL 'usuarios'.
# Isso irá gerar rotas como /usuarios/, /usuarios/{id}/, etc.
router.register(r'usuarios', UsuarioViewSet)

# Registra o ViewSet de colaboradores com o prefixo de URL 'colaboradores'.
# Isso irá gerar rotas como /colaboradores/, /colaboradores/{usuario__cpf}/, etc.
router.register(r'colaboradores', ColaboradorViewSet)

# As URLs da API são incluídas no padrão de URL principal do aplicativo.
# O router lida com a criação de todas as rotas necessárias para os ViewSets registrados.
urlpatterns = [
    path('', include(router.urls)),
]