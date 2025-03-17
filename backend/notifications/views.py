from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer
from django.shortcuts import get_object_or_404
from core.permissions import IsRegularUser, IsAdminOrStaff
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import IsAuthenticated  # Ensure the user is authenticated
from courses.models import Enrollment
from django.db.models import Q
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class NotificationListView(APIView):
    permission_classes = [IsRegularUser]

    @swagger_auto_schema(
        operation_description="Retrieve all notifications for the authenticated user.",
        responses={200: NotificationSerializer(many=True)}
    )

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user, course__isnull=True).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated] 
    @swagger_auto_schema(
        operation_description="Mark a notification as read.",
        responses={200: openapi.Response("Notification marked as read.")}
    )

    def post(self, request, notification_uuid):
        try:
            notification = get_object_or_404(Notification, notification_id=notification_uuid, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"success": True, "message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f" ERROR in MarkAsReadView: {e}")
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
    
class UpdateNotificationView(APIView):
    permission_classes = [IsAdminOrStaff]  #Only admins can update notifications
    @swagger_auto_schema(
        operation_description="Update notification details (Admin only).",
        request_body=NotificationSerializer,
        responses={200: NotificationSerializer()}
    )

    def put(self, request, notification_uuid):
        notification = get_object_or_404(Notification, notification_id=notification_uuid)
        serializer = NotificationSerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Notification updated successfully.", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AdminCreateNotificationView(APIView):
    permission_classes = [IsAdminOrStaff]

    @swagger_auto_schema(
        operation_description="Admin sends a notification (either global or course-specific).",
        request_body=NotificationSerializer,
        responses={201: NotificationSerializer()}
    )
    def post(self, request):
        course_id = request.data.get("course")  # Optional Course ID
        message = request.data.get("message")

        if not message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        if course_id:
            students = Enrollment.objects.filter(course_id=course_id).values_list("user", flat=True)
        else:
            students = Enrollment.objects.values_list("user", flat=True).distinct()

        notifications = [Notification(notification_id=uuid.uuid4(), user_id = user_id, course_id=course_id, message=message) for user_id in students]
        Notification.objects.bulk_create(notifications)

        return Response({"message": "Notifications sent successfully."}, status=status.HTTP_201_CREATED)


class StudentRelevantNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get notifications relevant to the student (based on enrolled courses).",
        responses={200: NotificationSerializer(many=True)}
    )
    def get(self, request):
        enrolled_courses = Enrollment.objects.filter(user=request.user).values_list("course_id", flat=True)
        notifications = Notification.objects.filter(
            Q(course__in=enrolled_courses)
        ).distinct().order_by('-created_at')

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminSendNotificationView(APIView):
    permission_classes = [IsAdminOrStaff]  # Only admins can send notifications

    @swagger_auto_schema(
        operation_description="Send a notification to all users.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "message": openapi.Schema(type=openapi.TYPE_STRING, description="Message content"),
            },
            required=["message"]
        ),
        responses={201: "Notification sent successfully"}
    )
    def post(self, request):
        message = request.data.get("message")
        if not message:
            return Response({"error": "Message content is required"}, status=status.HTTP_400_BAD_REQUEST)
        
         #Get all students (Avoid duplicates by using `distinct()`)
        students = User.objects.filter(user_type="student").distinct()

        notifications = []

        #Check for existing notifications with the same message for each student
        for student in students:
            #Avoid duplicate notifications
            existing_notification = Notification.objects.filter(user=student, message=message).exists()
            if not existing_notification:
                notifications.append(Notification(notification_id=uuid.uuid4(), user=student, message=message))

        if notifications:
            Notification.objects.bulk_create(notifications)
            return Response({"message": "Notifications sent successfully."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "No new notifications created (duplicates filtered)."}, status=status.HTTP_200_OK)
