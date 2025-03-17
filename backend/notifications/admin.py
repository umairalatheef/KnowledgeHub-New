from django.contrib import admin
from .models import Notification
from userauths.models import User
from django.contrib import messages


@admin.action(description="Send new notification to all students")
def send_notification_to_all_students(modeladmin, request, queryset):
    students = User.objects.filter(is_staff=False)  # Assuming students are non-staff users

    if students.exists():
        for student in students:
            Notification.objects.create(
                user=student,
                message="New video uploaded. Happy learning!"  # Fixed message or modify as needed
            )
        messages.success(request, "Notifications sent successfully to all students.")
    else:
        messages.warning(request, "No students found to send notifications.")

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id','notification_id','user', 'message', 'is_read', 'created_at')
    actions = [send_notification_to_all_students]  # Add the custom action

# from django.contrib import admin
# from .models import Notification
# from django.contrib.auth import get_user_model

# User = get_user_model()  # Your custom user model

# @admin.action(description="Send notification to all students")
# def send_notification_to_all_students(modeladmin, request, queryset):
#     for notification in queryset:
#         # Filter only students (assuming staff users are excluded)
#         students = User.objects.filter(is_staff=False)
#         for student in students:
#             Notification.objects.create(
#                 user=student,
#                 message=notification.message
#             )

# @admin.register(Notification)
# class NotificationAdmin(admin.ModelAdmin):
#     list_display = ('user', 'message', 'is_read', 'created_at')
#     actions = [send_notification_to_all_students]  # Add the custom action here
