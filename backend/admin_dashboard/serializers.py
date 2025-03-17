from rest_framework import serializers

class ActiveUserSummarySerializer(serializers.Serializer):
    #Serializes dynamically calculated active user stats
    total_enrolled_users = serializers.IntegerField()
    weekly_active_users = serializers.IntegerField()
    monthly_active_users = serializers.IntegerField()

