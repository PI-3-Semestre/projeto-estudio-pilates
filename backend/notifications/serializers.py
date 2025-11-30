# notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    content_type = serializers.StringRelatedField(source='content_type.model')
    object_id = serializers.IntegerField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'message',
            'level',
            'is_read',
            'created_at',
            'content_type',
            'object_id',
        ]
