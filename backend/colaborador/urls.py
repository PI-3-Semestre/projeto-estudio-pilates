from django.urls import path
from . import views

urlpatterns = [
    path('colaboradores/', views.ColaboradorListCreateView.as_view(), name='colaborador-list-create'),
    path('colaboradores/<int:pk>/', views.ColaboradorRetrieveUpdateDestroyView.as_view(), name='colaborador-detail'),

    path('cargos/', views.CargoListCreateView.as_view(), name='cargo-list-create'),
    path('cargos/<int:pk>/', views.CargoRetrieveUpdateDestroyView.as_view(), name='cargo-detail'),
]