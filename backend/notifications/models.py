from django.db import models
from django.conf import settings
from userauths.models import User
from courses.models import Course
from courses.models import Enrollment
import uuid

class Notification(models.Model):
    notification_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  #Add unique UUID
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Points to your custom user model
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    course = models.ForeignKey(
        Course,  # Link notification to a specific course (optional)
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications"
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.message[:50]}"
    

    @staticmethod
    def notify_enrolled_students(course, message):
        """
        Notify all students enrolled in a specific course about an update.
        """
        enrolled_students = Enrollment.objects.filter(course=course).values_list("user", flat=True)
        notifications = [Notification(notification_id=uuid.uuid4(),user_id=user_id, course=course, message=message) for user_id in enrolled_students]
        Notification.objects.bulk_create(notifications)  # Bulk insert for efficiency

    @staticmethod
    def send_general_notification(message):
        """
        Send a general notification to all students (e.g., admin announcements).
        """
        students = User.objects.filter(user_type="student")
        notifications = [
            Notification(notification_id=uuid.uuid4(),user=student, message=message)
            for student in students
        ]
        Notification.objects.bulk_create(notifications)  # Bulk insert for efficiency


    # @staticmethod
    # def notify_students(video_title):

    #     students = User.objects.filter(is_staff=False)  #Notify only studenst
    #     for student in students:
    #         Notification.objects.create(
    #             user=student,
    #             message=f"A new video '{video_title}' has been uploaded. Check it out!",
    #         )
