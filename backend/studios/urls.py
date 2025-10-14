# studios/urls.py
from django.urls import path
from .views import StudioListView

urlpatterns = [
    # Ex: GET /api/studios/
    path('', StudioListView.as_view(), name='studio-list'),

    # Ex: GET /api/studios/1/relatorio-financeiro/ # EXEMPLO
    #path('<int:studio_id>/relatorio-financeiro/', RelatorioFinanceiroView.as_view(), name='studio-finance-report'),
]