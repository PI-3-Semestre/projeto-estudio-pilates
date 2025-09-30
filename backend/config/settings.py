from decouple import config
from pathlib import Path
from decouple import config # <-- ADICIONADO: Para ler o arquivo .env

BASE_DIR = Path(__file__).resolve().parent.parent
 #19-cadastro-colaborador
SECRET_KEY = "django-insecure-ff*b)cf$(8etn0pl7so44lap*utzl0-6huc=8#2d)9-p@g0@o$"
DEBUG = True



# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default="django-insecure-ff*b)cf$(8etn0pl7so44lap*utzl0-6huc=8#2d)9-p@g0@o$")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)


ALLOWED_HOSTS = []

# --- Verifique se esta seção está correta ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
 #19-cadastro-colaborador
    # Apps de terceiros
    'rest_framework',
    'rest_framework_simplejwt',
    # Nossos apps
    'usuarios',


    # --- Apps de Terceiros ---
    'rest_framework',       # Para a criação de APIs
    'drf_spectacular',      # Para a documentação (Swagger UI)

    # --- Nossas Apps ---
    'usuarios',
    'agendamentos',
    'financeiro',
    'avaliacoes',

]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
WSGI_APPLICATION = "config.wsgi.application"
 #19-cadastro-colaborador
DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE'),



# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# --- Bloco de Banco de Dados ATUALIZADO ---
DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.mysql'),

        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
 #19-cadastro-colaborador
        'PORT': config('DB_PORT'),

        'PORT': config('DB_PORT', cast=int),

    }
}
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
 #19-cadastro-colaborador
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"



# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

# --- Configurações de Idioma e Fuso Horário ATUALIZADAS ---
LANGUAGE_CODE = "pt-br"

TIME_ZONE = "America/Sao_Paulo"


USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

 #19-cadastro-colaborador
# --- E garanta que este bloco final exista ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}
AUTH_USER_MODEL = 'usuarios.Usuario'
AUTHENTICATION_BACKENDS = [
    'usuarios.auth_backends.CPFOrEmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]


# --- Configurações do Django REST Framework e Swagger ---
REST_FRAMEWORK = {
    # Define o gerador de esquema da API para o drf-spectacular
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

