from django.db import models
from django.conf import settings
from courses.models import Video

class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes")
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="notes")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    video_position = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Note by {self.user.username} at {self.video_position}s on {self.video.title}"

