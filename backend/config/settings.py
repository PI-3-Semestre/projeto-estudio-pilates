# --- Configurações do CORS (Cross-Origin Resource Sharing) ---
# https://github.com/adamchainz/django-cors-headers

# ATENÇÃO: Substitua o IP de exemplo pelo endereço IP do seu frontend.
# Se o seu frontend roda na porta 3000, a origem seria "http://SEU_IP_AQUI:3000".
CORS_ALLOWED_ORIGINS = [
    # Exemplo para um frontend rodando localmente em React/Vue/Angular:
    # "http://localhost:3000",
    # "http://127.0.0.1:3000",
    
    # Exemplo para um IP específico na sua rede:
    # "http://192.168.1.100:3000",
]

# Se você precisar liberar o acesso para todos (NÃO RECOMENDADO EM PRODUÇÃO),
# você pode descomentar a linha abaixo e comentar a de cima.
# CORS_ALLOW_ALL_ORIGINS = True

# Métodos HTTP que são permitidos.
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Cabeçalhos HTTP que podem ser usados na requisição.
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]