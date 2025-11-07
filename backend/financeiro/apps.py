from django.apps import AppConfig


class FinanceiroConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "financeiro" #

    def ready(self):
        """
        Este método é chamado pelo Django quando a aplicação
        está pronta. É o local correto para importar os signals.
        """
        import financeiro.signals