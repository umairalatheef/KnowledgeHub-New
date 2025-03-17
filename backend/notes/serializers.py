from rest_framework import serializers
from .models import Note
from courses.models import Video

class NoteSerializer(serializers.ModelSerializer):
    video_title = serializers.CharField(source='video.title', read_only=True)
    video = serializers.PrimaryKeyRelatedField(queryset=Video.objects.all(), required=False)

    class Meta:
        model = Note
        fields = ['id', 'user', 'video', 'video_title', 'content','video_position', 'timestamp', 'updated_at']
        read_only_fields = ['id', 'user', 'timestamp', 'updated_at']

    def create(self, validated_data):
    # Debugging to check context values
        video = self.context.get('video')
        user = self.context.get('user')

        if not video:
            raise serializers.ValidationError({'video': 'This field is required.'})

        if not user:
            raise serializers.ValidationError({'user': 'This field is required.'})

        # Add video and user to validated data
        validated_data['video'] = video
        validated_data['user'] = user

        # Debugging to see validated_data before creation
        print("Validated Data:", validated_data)

        return super().create(validated_data)
