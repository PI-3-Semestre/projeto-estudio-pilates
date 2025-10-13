from django.apps import AppConfig

class StudiosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'studios'

    def ready(self):
        # Importa os sinais para que sejam registrados na inicialização do app.
        import studios.signals