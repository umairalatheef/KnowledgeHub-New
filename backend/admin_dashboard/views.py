from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, F, Q, Avg
from django.db.models.functions import TruncDate
from core.permissions import IsAdminOrStaff
from courses.models import Enrollment, Course, VideoProgress, Video
from userauths.models import User, Profile
from .serializers import ActiveUserSummarySerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from userauths.serializers import StudentProfileSerializer, AdminProfileSerializer
from core.permissions import IsAdminOrStaff
from django.shortcuts import get_object_or_404


class ActiveUsersView(APIView):
    permission_classes = [IsAdminOrStaff]
    @swagger_auto_schema(
        operation_description="Retrieve daily active users count for the last N days.",
        manual_parameters=[
            openapi.Parameter('days', openapi.IN_QUERY, description="Number of past days to include (default: 30).", type=openapi.TYPE_INTEGER)
        ],
        responses={200: openapi.Response("List of daily active user counts")}
    )

    def get(self, request):
        #Fetch daily active users for the last N days (default: 30).
        days = request.query_params.get('days', 30)

        try:
            days = int(days)
        except ValueError:
            return Response({"error": "Days parameter must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate the start date
        start_date = timezone.now() - timedelta(days=days)

        # Query active users per day
        daily_counts = (
            Enrollment.objects.filter(enrolled_date__gte=start_date)
            .annotate(date=TruncDate('enrolled_date'))
            .values('date')
            .annotate(active_users_count=Count('user', distinct=True))
            .order_by('date')
        )

        return Response(list(daily_counts), status=status.HTTP_200_OK)


class ActiveUsersSummaryView(APIView):
    permission_classes = [IsAdminOrStaff]
    @swagger_auto_schema(
        operation_description="Retrieve total enrolled users, weekly active users, and monthly active users.",
        responses={200: ActiveUserSummarySerializer()}
    )

    def get(self, request):
        #Fetch total, weekly, and monthly active users.

        def count_active_users(days=None):
            #Helper function to count unique users enrolled within a time range.
            queryset = Enrollment.objects
            if days:
                queryset = queryset.filter(enrolled_date__gte=timezone.now() - timedelta(days=days))
            return queryset.values('user').distinct().count()

        data = {
            'total_enrolled_users': count_active_users(),
            'weekly_active_users': count_active_users(7),
            'monthly_active_users': count_active_users(30),
        }

        serializer = ActiveUserSummarySerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseCompletionRateView(APIView):
    permission_classes = [IsAdminOrStaff]
    @swagger_auto_schema(
        operation_description="Retrieve course completion rates.",
        responses={200: openapi.Response("List of course completion rates")}
    )

    def get(self, request):
        #Calculate the completion rate for each course.
        courses = Course.objects.annotate(
            total_students=Count('enrollments', distinct=True),
            total_videos=Count('videos', distinct=True)
        )

        completion_data = []

        for course in courses:
            if course.total_students == 0 or course.total_videos == 0:
                completion_rate = 0
            else:
                completed_students = Enrollment.objects.filter(
                    course=course,
                    user__in=VideoProgress.objects.filter(
                        video__course=course,
                        is_completed=True
                    ).values('user')
                ).distinct().count()

                completion_rate = (completed_students / course.total_students) * 100 if course.total_students else 0

            completion_data.append({
                "course_title": course.title,
                "total_students": course.total_students,
                "completion_rate": round(completion_rate, 2),
            })

        return Response(completion_data, status=status.HTTP_200_OK)


class PlatformStatisticsView(APIView):
    permission_classes = [IsAdminOrStaff]
    @swagger_auto_schema(
        operation_description="Retrieve platform statistics including total users (excluding admins), courses, enrollments, and videos.",
        responses={200: openapi.Response("Overall platform statistics")}
    )

    def get(self, request):
        #Retrieve overall platform statistics.
        total_users = User.objects.filter(is_staff=False, is_superuser=False).exclude(user_type = 'admin').count()  #Exclude admins
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        total_videos = Video.objects.count()

        return Response({
            "total_users": total_users, #Now counts only Student users
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "total_videos": total_videos,
        }, status=status.HTTP_200_OK)
    
class StudentListAPIView(APIView):
    
    #Retrieve all student profiles (Admin only).
    
    permission_classes = [IsAdminOrStaff]

    @swagger_auto_schema(
        operation_description="Retrieve all student profiles (Admin only).",
        responses={200: StudentProfileSerializer(many=True)}
    )
    def get(self, request):
        profiles = Profile.objects.filter(user__user_type='student')
        serializer = StudentProfileSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteStudentAPIView(APIView):
    
    #Allows admins to delete a student profile.
    
    permission_classes = [IsAdminOrStaff]

    @swagger_auto_schema(
        operation_description="Delete a student profile (Admin only).",
        responses={200: openapi.Response("Student profile deleted successfully")}
    )
    def delete(self, request, user_id):
        student = get_object_or_404(User, id=user_id, user_type='student')
        student.delete()
        return Response({"message": "Student profile deleted successfully"}, status=status.HTTP_200_OK)


class AdminResetStudentPasswordAPIView(APIView):

    #Allows an admin to reset a student's password.
    
    permission_classes = [IsAdminOrStaff]

    @swagger_auto_schema(
        operation_description="Admin resets a student's password.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["new_password"],
            properties={
                "new_password": openapi.Schema(type=openapi.TYPE_STRING, description="New password for the student")
            }
        ),
        responses={200: openapi.Response("Password updated successfully")}
    )
    def post(self, request, user_id):
        student = get_object_or_404(User, id=user_id, user_type='student')
        new_password = request.data.get("new_password")

        if not new_password:
            return Response({"error": "New password is required"}, status=status.HTTP_400_BAD_REQUEST)

        student.set_password(new_password)
        student.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)





# class AdminUsersView(APIView):
#     permission_classes = [IsAdminUser]  # Restrict access to admins

#     def get(self, request):
#         users = User.objects.all().values("id", "username", "email", "is_staff", "is_active")

#         if not users:
#             return Response({"message": "No users found."}, status=status.HTTP_404_NOT_FOUND)

#         return Response({"users": list(users)}, status=status.HTTP_200_OK)


