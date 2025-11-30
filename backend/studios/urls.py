# studios/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudioViewSet, DashboardStudioView

router = DefaultRouter()

router.register(r'', StudioViewSet, basename='studio')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:studio_pk>/dashboard/', DashboardStudioView.as_view(), name='studio-dashboard'),
]
