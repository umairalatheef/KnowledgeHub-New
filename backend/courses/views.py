from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Course, Video, Resource, VideoProgress, Enrollment
from .serializers import CourseSerializer, VideoSerializer, ResourceSerializer,VideoProgressSerializer,EnrollmentSerializer,CourseProgressSerializer,VideoHistorySerializer, StudentCourseSerializer,generate_signed_url
from django.shortcuts import get_object_or_404
from core.permissions import IsAdminOrStaff,IsRegularUser
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import AllowAny
from notifications.models import Notification

class CourseListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_description="Retrieve all courses",
        responses={200: CourseSerializer(many=True)}
    )

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Create a new course",
        request_body=CourseSerializer,
        responses={201: CourseSerializer()}
    )

    def post(self, request):

        print("DEBUG: User making request:", request.user)  #Debugging
        print("DEBUG: Is authenticated?", request.user.is_authenticated)  #Debugging
        serializer = CourseSerializer(data=request.data, context = {"request": request})
        if serializer.is_valid():
            serializer.save()
            # course = serializer.save(created_by=request.user)  # Automatically assign the current user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("DEBUG: Errors in request:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_description="Retrieve details of a specific course",
        responses={200: CourseSerializer()}
    )

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        serializer = CourseSerializer(course)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Edit course details",
        request_body=CourseSerializer,
        responses={200: CourseSerializer()}
    )
    def put(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
                # Convert request data to mutable before updating
        data = request.data.copy()

        # Ensure the image is handled properly
        if "image" not in request.data or request.data.get("image") == "null":
            data.pop("image", None)  # Remove image field if not updating
        serializer = CourseSerializer(course, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print("DEBUG: Errors ->", serializer.errors) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Delete a specific course",
        responses={204: "No content"}
    )

    def delete(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VideoListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]  # Enable form-data handling
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    @swagger_auto_schema(
        operation_description="Upload a video for a specific course",
        request_body=VideoSerializer,
        responses={201: VideoSerializer()}
    )

    def post(self, request, course_id):
        # Ensure the course exists
        course = get_object_or_404(Course, id=course_id)

        # Attach the course ID to the data
        request.data['course'] = course.id

        serializer = VideoSerializer(data=request.data)
        if serializer.is_valid():
            video = serializer.save(course=course)  # Explicitly set the course

            #Notify enrolled students
            Notification.notify_enrolled_students(
                course, f"A new video '{video.title}' has been uploaded in '{course.title}'."
            )
            return Response(
                {
                    "message": "Video successfully created.",
                    "video": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResourceListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]  # Enable form-data handling
    permission_classes = [IsAuthenticated, IsAdminOrStaff]


    @swagger_auto_schema(
        operation_description="Upload a resource for a specific course",
        request_body=ResourceSerializer,
        responses={201: ResourceSerializer()}
    )

    def post(self, request, course_id):
        # Ensure the course exists
        course = get_object_or_404(Course, id=course_id)

        # Attach the course ID to the data
        request.data['course'] = course.id

        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            resource = serializer.save(course=course)  # Explicitly set the course

            #Notify enrolled students
            Notification.notify_enrolled_students(
                course, f"A new resource has been uploaded for '{course.title}'."
            )
            return Response(
                {
                    "message": "Resource successfully created.",
                    "resource": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class VideoDetailView(APIView):
    
    #Allows students and admins to view video details.
    
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    @swagger_auto_schema(
        operation_description="Retrieve a video's details",
        responses={200: VideoSerializer()}
    )
    def get(self, request, course_id, video_id):
        course = get_object_or_404(Course, id=course_id)
        video = get_object_or_404(Video, id=video_id, course=course)

        # Check if the user is allowed to view the video
        if not (request.user.is_staff or request.user.user_type == "admin"):
            enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
            if not enrolled:
                return Response({"message": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        # Serialize video data
        serializer = VideoSerializer(video)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Edit video details",
        request_body=VideoSerializer,
        responses={200: VideoSerializer()}
    )
    def put(self, request, course_id, video_id):
        video = get_object_or_404(Video, id=video_id, course__id=course_id)
        serializer = VideoSerializer(video, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Delete a specific video",
        responses={204: "No content"}
    )
    def delete(self, request, course_id, video_id):
        video = get_object_or_404(Video, id=video_id, course__id=course_id)
        video.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResourceDetailView(APIView):
    
    #Allows students to access resources of an enrolled course.
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    @swagger_auto_schema(
        operation_description="Retrieve resource details",
        responses={200: ResourceSerializer()}
    )

    def get(self, request, course_id, resource_id):
        course = get_object_or_404(Course, id=course_id)
        resource = get_object_or_404(Resource, id=resource_id, course=course)

        #Allow access if user is admin or enrolled
        if not (request.user.is_staff or request.user.user_type == "admin"):
            enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
            if not enrolled:
                return Response(
                    {"message": "You are not enrolled in this course."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Increment download count for tracking
        resource.increment_download_count()

        serializer = ResourceSerializer(resource)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Edit resource details",
        request_body=ResourceSerializer,
        responses={200: ResourceSerializer()}
    )
    def put(self, request, course_id, resource_id):
        resource = get_object_or_404(Resource, id=resource_id, course__id=course_id)
        serializer = ResourceSerializer(resource, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Delete a specific resource",
        responses={204: "No content"}
    )
    def delete(self, request, course_id, resource_id):
        resource = get_object_or_404(Resource, id=resource_id, course__id=course_id)
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class StudentVideoProgressView(APIView):
    """
    Allows students to track their own progress in a video.
    """
    permission_classes = [IsRegularUser]

    @swagger_auto_schema(
        operation_description="Track student progress on a video",
        request_body=VideoProgressSerializer,
        responses={201: VideoProgressSerializer()}
    )
    def post(self, request, course_id, video_id):
        # Ensure the course and video exist
        course = get_object_or_404(Course, id=course_id)
        video = get_object_or_404(Video, id=video_id, course=course)

        # Check if the student is enrolled in the course
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({"message": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        # Save progress
        serializer = VideoProgressSerializer(data=request.data, context={'user': request.user, 'video': video})
        if serializer.is_valid():
            progress_instance = serializer.save(user=request.user, video=video)

            # Attach course_id and course_title dynamically for dashboard updates
            progress_instance.course_id = progress_instance.video.course.id
            progress_instance.course_title = progress_instance.video.course.title

            return Response({"message": "Progress saved.", "progress": VideoProgressSerializer(progress_instance).data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class AdminVideoProgressView(APIView):
    
    #Allows admins to view progress of all students for a specific video.
    permission_classes = [IsAdminOrStaff]
    @swagger_auto_schema(
        operation_description="Retrieve all students' progress for a specific video.",
        responses={200: VideoProgressSerializer(many=True)}
    )

    def get(self, request, course_id, video_id):
        # Ensure the course and video exist
        course = get_object_or_404(Course, id=course_id)
        video = get_object_or_404(Video, id=video_id, course=course)

        # Query all progress records for the video
        progress_records = VideoProgress.objects.filter(video=video)
        serializer = VideoProgressSerializer(progress_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StudentCourseProgressView(APIView):
    # Returns the student's overall progress in a course.
    permission_classes = [IsAuthenticated, IsRegularUser]
    @swagger_auto_schema(
        operation_description="Retrieve a student's progress in a course.",
        responses={200: CourseProgressSerializer()}
    )

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        # Check if the student is enrolled in the course.
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({"message": "You are not enrolled in this course."}, status=403)

        total_videos = course.videos.count()
        completed_videos = VideoProgress.objects.filter(video__course=course, user=request.user, is_completed=True).count()
        progress_percentage = (completed_videos / total_videos) * 100 if total_videos > 0 else 0

        data = {
            "course_title": course.title,
            "total_videos": total_videos,
            "completed_videos": completed_videos,
            "progress_percentage": progress_percentage,
        }
        serializer = CourseProgressSerializer(data)
        return Response(serializer.data, status=200)

class StudentVideoHistoryView(APIView):
    # Lists a student's watched videos in a course.
    permission_classes = [IsAuthenticated, IsRegularUser]
    @swagger_auto_schema(
        operation_description="Retrieve a list of watched videos in a course.",
        responses={200: VideoHistorySerializer(many=True)}
    )

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        # Check if the student is enrolled in the course.
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({"message": "You are not enrolled in this course."}, status=403)

        progress_records = VideoProgress.objects.filter(video__course=course, user=request.user)
        serializer = VideoHistorySerializer(progress_records, many=True)
        return Response(serializer.data, status=200)
    
    
class StudentCourseDetailView(APIView):
    """
    Allows students to view course details (videos & resources).
    Videos and resources are locked unless they are enrolled.
    """
    permission_classes = [IsAuthenticated, IsRegularUser]

    @swagger_auto_schema(
        operation_description="Retrieve course details. Videos & resources are locked if not enrolled.",
        responses={200: StudentCourseSerializer()}
    )
    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        is_enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
        if not is_enrolled:
            return Response({"message": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentCourseSerializer(course, context={'is_enrolled': is_enrolled})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class StudentVideoDetailView(APIView):
    """
    Allows students to access video details if enrolled.
    """
    permission_classes = [IsAuthenticated, IsRegularUser]

    @swagger_auto_schema(
        operation_description="Retrieve video details if the student is enrolled.",
        responses={200: VideoSerializer()}
    )
    def get(self, request, course_id, video_id):
        course = get_object_or_404(Course, id=course_id)
        video = get_object_or_404(Video, id=video_id, course=course)

        # Check if the student is enrolled
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({"message": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)
        
        # Fetch the last watched position
        progress = VideoProgress.objects.filter(user=request.user, video=video).first()
        last_watched_position = progress.last_watched_position if progress else 0  # Default to 0 if no progress found

        serializer = VideoSerializer(video)
        video_data = serializer.data
        video_data["last_watched_position"] = last_watched_position  #Add this field to the response

        print(f"Returning video details with last watched position: {last_watched_position}")  # Debugging
        return Response(video_data, status=status.HTTP_200_OK)

class StudentResourceDetailView(APIView):
    """
    Allows students to access course resources if enrolled.
    """
    permission_classes = [IsAuthenticated, IsRegularUser]

    @swagger_auto_schema(
        operation_description="Retrieve resource details if enrolled.",
        responses={200: ResourceSerializer()}
    )
    def get(self, request, course_id, resource_id):
        course = get_object_or_404(Course, id=course_id)
        resource = get_object_or_404(Resource, id=resource_id, course=course)

        # Check if student is enrolled
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response(
                {"message": "You are not enrolled in this course."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ResourceSerializer(resource)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class StudentEnrolledCoursesView(APIView):
    """
    Lists all courses a student is enrolled in.
    """
    permission_classes = [IsAuthenticated, IsRegularUser]

    @swagger_auto_schema(
        operation_description="Retrieve all courses a student is enrolled in.",
        responses={200: EnrollmentSerializer(many=True)}
    )
    def get(self, request):
        enrollments = Enrollment.objects.filter(user=request.user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class StudentCourseEnrollmentView(APIView):
    """
    Allows a student to enroll in a course.
    """
    permission_classes = [IsAuthenticated, IsRegularUser]

    @swagger_auto_schema(
        operation_description="Enroll a user in a specific course",
        responses={201: EnrollmentSerializer()}
    )
    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        # Check if the user is already enrolled
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user, 
            course=course
        )
        if not created:
            return Response({"message": "Already enrolled in this course."}, status=status.HTTP_200_OK)

        return Response(
            {"message": "Enrolled successfully.", "enrolled_date": enrollment.enrolled_date},
            status=status.HTTP_201_CREATED,
        )
    

class PublicCourseListView(APIView):
    """
    List all available courses. Publicly accessible.
    """
    permission_classes = [AllowAny]  # Anyone can access this

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=200)


class PublicCourseDetailView(APIView):
    """
    Get course details without requiring enrollment. Videos & resources are locked.
    """
    permission_classes = [AllowAny]  # Anyone can view details

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        course_data = CourseSerializer(course).data

        # Lock videos & resources if user is not enrolled
        locked_videos = [{"id": video.id, "title": video.title, "locked": True} for video in course.videos.all()]
        locked_resources = [{"id": resource.id, "title": resource.title, "locked": True} for resource in course.resources.all()]

        course_data["videos"] = locked_videos
        course_data["resources"] = locked_resources

        return Response(course_data, status=200)



    