from rest_framework import serializers
from courses.models import VideoProgress, Enrollment, Course, Video
from courses.serializers import EnrollmentSerializer,VideoProgressSerializer  # Reuse existing serializer
from core.s3_signed_url import generate_signed_url

class DashboardEnrollmentSerializer(EnrollmentSerializer):
    progress_percentage = serializers.SerializerMethodField()
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_description = serializers.CharField(source="course.description", read_only=True)
    course_image_url = serializers.SerializerMethodField()

    def get_progress_percentage(self, obj):
        user = obj.user #self.context.get('user')
        course = obj.course
        total_videos = course.videos.count()
        completed_videos = VideoProgress.objects.filter(video__course=course, user=user, is_completed=True).count()
        return (completed_videos / total_videos * 100) if total_videos > 0 else 0
    
    def get_course_image_url(self, obj):
        if obj.course.image:
            signed_url = generate_signed_url(f"media/{obj.course.image.name}")
            print(f" Signed URL for {obj.course.title}: {signed_url}")  # Debug log
            return signed_url
        print(f" No image found for course {obj.course.title}")  # Debug log
        return None

    class Meta(EnrollmentSerializer.Meta):
        fields = EnrollmentSerializer.Meta.fields + ['progress_percentage','course_title','course_description',"course_image_url",]


class LatestCourseSerializer(serializers.ModelSerializer):
    course_image_url = serializers.SerializerMethodField()

    def get_course_image_url(self, obj):
        if obj.image:
            return generate_signed_url(f"media/{obj.image.name}")  
        return None 
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'course_image_url']


class PersonalDashboardSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(source='id')
    name = serializers.CharField(source='username')
    enrolled_courses = serializers.SerializerMethodField()
    continue_watching = serializers.SerializerMethodField()
    available_courses = serializers.SerializerMethodField()

    def get_enrolled_courses(self, obj):
        enrollments = Enrollment.objects.filter(user=obj)
        serializer = DashboardEnrollmentSerializer(enrollments, many=True, context={'user': obj})
        return serializer.data

    def get_continue_watching(self, obj):
        in_progress_videos = VideoProgress.objects.filter(user=obj, is_completed=False, last_watched_position__gt=0).order_by('-updated_at')  # Ensures latest progress is at the top
    
        if not in_progress_videos.exists():
            print(" No Videos Found for Continue Watching!")
            return []  # Return empty list if no videos are in progress
        
        print("Continue Watching Videos:", in_progress_videos)  #Debugging

        for progress in in_progress_videos:
            progress.course_id = progress.video.course.id
            progress.course_title = progress.video.course.title


        serializer = VideoProgressSerializer(in_progress_videos, many=True)
        return serializer.data

    def get_available_courses(self, obj):
        enrolled_course_ids = Enrollment.objects.filter(user=obj).values_list('course_id', flat=True)
        latest_courses = Course.objects.exclude(id__in=enrolled_course_ids).order_by('-created_at')[:5]
        serializer = LatestCourseSerializer(latest_courses, many=True)
        return serializer.data

class DashboardVideoProgressSerializer(VideoProgressSerializer):
    course_title = serializers.CharField(source="video.course.title", read_only=True)
    course_id = serializers.IntegerField(source="video.course.id", read_only=True)
    video_thumbnail = serializers.SerializerMethodField()

    def get_video_thumbnail(self, obj):
        if obj.video.thumbnail:
            return generate_signed_url(f"media/{obj.video.thumbnail.name}")  # Fetch signed URL for video thumbnail
        return None

    class Meta:
        model = VideoProgress
        fields = VideoProgressSerializer.Meta.fields + ["course_title", "course_id", "video_thumbnail"]
