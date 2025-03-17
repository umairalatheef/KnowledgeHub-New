from rest_framework import serializers
from django.core.files.base import File
from .models import Course, Video, Resource,VideoProgress, Video, Enrollment
from core.s3_signed_url import generate_signed_url
from django.core.validators import FileExtensionValidator
import os

class VideoSerializer(serializers.ModelSerializer):
    signed_url = serializers.SerializerMethodField()
    is_published = serializers.BooleanField(read_only=True)  #Default read-only

    video_file = serializers.FileField(
        validators=[
            FileExtensionValidator(
                allowed_extensions=['mp4', 'mkv', 'avi', 'mov']
            )
        ],
        help_text="Allowed formats: mp4, mkv, avi, mov"
    )

    duration = serializers.IntegerField(
        help_text="Duration must be an integer (e.g., 120 for 2 minutes)"
    )

    class Meta:
        model = Video
        fields = ['id', 'title','description', 'video_file', 'duration', 'uploaded_at','is_published', 'signed_url']
        read_only_fields = ['id', 'uploaded_at', 'signed_url']

    def get_signed_url(self, obj):
        #Generate signed URL for S3
        if obj.video_file:
            return generate_signed_url(f"media/{obj.video_file.name}")  #Ensure this method correctly generates an accessible signed URL
        return None  #If no file is present, return None

    def validate_video_file(self, value):
        # Ensure only the base filename is saved, avoiding full paths
        if isinstance(value, File):
            value.name = os.path.basename(value.name)
        return value

    def validate_title(self, value):
        # Ensure the title is a valid string
        if not isinstance(value, str) or len(value.strip()) == 0:
            raise serializers.ValidationError("Title must be a non-empty string.")
        return value

    def validate_duration(self, value):
        # Ensure the duration is a positive integer
        if not isinstance(value, int) or value <= 0:
            raise serializers.ValidationError("Duration must be a positive integer.")
        return value

    def create(self, validated_data):
        #Sanitize the video file name before saving
        video_file = validated_data.get('video_file')
        if video_file:
            video_file.name = os.path.basename(video_file.name)

        # Save and return the video object
        return Video.objects.create(**validated_data)
    
    def get_video_file_url(self, obj):
        #Return the actual stored URL of the video file, not a signed URL
        if obj.video_file:
            return obj.video_file.url  #This returns the direct file URL
        return None
    
    def update(self, instance, validated_data):
        #Allow replacing the existing video file
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.is_published = validated_data.get('is_published', instance.is_published)

        #Check if a new file is uploaded, delete the old one & replace it
        new_file = validated_data.get('video_file', None)
        if new_file:
            if instance.video_file:
                instance.video_file.delete(save=False)  # Delete old video
            instance.video_file = new_file  # Assign new video

        instance.save()
        return instance

class ResourceSerializer(serializers.ModelSerializer):
    download_count = serializers.IntegerField(read_only= True)
    
    class Meta:
        model = Resource
        fields = ['id', 'title', 'file', 'uploaded_at','resource_type','download_count']

    def validate_title(self, value):
        # Ensure the title is a valid string
        if not isinstance(value, str) or len(value.strip()) == 0:
            raise serializers.ValidationError("Title must be a non-empty string.")
        return value
    
    def validate_resource_type(self, value):
        valid_types = ["pdf","word","powerpoint","excel", "link"]
        if value.lower() not in valid_types:  #Case-insensitive validation
            raise serializers.ValidationError(f'"{value}" is not a valid choice. Choose from {valid_types}')
        return value.lower()  #Always store lowercase

    def create(self, validated_data):
        # Save and return the resource object
        return Resource.objects.create(**validated_data)


class CourseSerializer(serializers.ModelSerializer):
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    videos = VideoSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True) 
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'start_date',
            'end_date',
            'created_by',
            'created_at',
            'videos',
            'resources',
            'image',
            'image_url'
        ]
        read_only_fields = ['image_url']

    def validate_title(self, value):
        # Ensure the title is a valid string
        if not isinstance(value, str) or len(value.strip()) == 0:
            raise serializers.ValidationError("Title must be a non-empty string.")
        return value

    def create(self, validated_data):
        request = self.context.get("request")  # Ensure request context is available
        if request and request.user:
            validated_data["created_by"] = request.user  # Assign logged-in user
        else:
            raise serializers.ValidationError({"created_by": "This field is required."})
        return super().create(validated_data)
    
    def get_image_url(self, obj):
        #Generate signed URL for S3 images
        if obj.image:
            return generate_signed_url(f"media/{obj.image.name}")  
        return None
    
    def update(self, instance, validated_data):
        #Preserve existing image if no new image is provided
        if 'image' in validated_data:
            if instance.image and validated_data['image'] is not None:
                instance.image.delete(save=False)
            instance.image = validated_data['image']
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.save()
        return instance

class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Returns enrollment details with course name & description.
    """
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_description = serializers.CharField(source='course.description', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'course_title', 'course_description', 'user_name', 'enrolled_date']
        read_only_fields = ['id', 'user', 'course', 'enrolled_date']


class VideoProgressSerializer(serializers.ModelSerializer):
    """
    Serializer to handle video progress for students and admins.
    """
    video = serializers.IntegerField(source='video.id', read_only=True)
    video_title = serializers.CharField(source='video.title', read_only=True)
    course_id = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()  # Use dynamic calculation
    last_watched_position = serializers.IntegerField()  # Ensure it is serialized
    video_thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoProgress
        fields = [
            'id', 'user', 'video', 'video_title', 'course_id', 'course_title',
            'progress_percentage', 'last_watched_position', 'is_completed', 'updated_at','video_thumbnail_url'
        ]
        read_only_fields = ['id', 'updated_at', 'user', 'video', 'video_title', 'course_id', 'course_title', 'is_completed']

    def get_course_id(self, obj):
        """Fetch course ID from related Video object."""
        return obj.video.course.id if obj.video.course else None  # Safe handling

    def get_course_title(self, obj):
        """Fetch course title from related Video object."""
        return obj.video.course.title if obj.video.course else None

    def get_progress_percentage(self, obj):
        """
        Dynamically calculate progress percentage for a course.
        Ensures consistency with `DashboardEnrollmentSerializer`.
        """
        user = obj.user
        course = obj.video.course
        total_videos = course.videos.count()
        completed_videos = VideoProgress.objects.filter(video__course=course, user=user, is_completed=True).count()
        return (completed_videos / total_videos * 100) if total_videos > 0 else 0
    
    def get_video_thumbnail_url(self, obj):
        """Generate signed URL for video thumbnail"""
        if obj.video.thumbnail:  # Assuming video has a `thumbnail` field
            return generate_signed_url(f"media/{obj.video.thumbnail.name}")  
        return None  # If no thumbnail, return None

    def validate_progress_percentage(self, value):
        """
        Ensure the progress percentage is between 0 and 100.
        """
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress percentage must be between 0 and 100.")
        return value

    def validate_last_watched_position(self, value):
        """
        Ensure the last watched position is non-negative.
        """
        if value < 0:
            raise serializers.ValidationError("Last watched position cannot be negative.")
        return value

    def create(self, validated_data):
        """
        Handles creation of video progress. If a record exists, update it.
        """
        user = self.context['user']
        video = self.context['video']

        # Fetch existing progress or create a new one
        progress, created = VideoProgress.objects.update_or_create(
            user=user,
            video=video,
            defaults={
                'last_watched_position': validated_data.get('last_watched_position', 0),
                'is_completed': validated_data.get('is_completed', False)
            }
        )

        # Recalculate progress percentage dynamically
        total_videos = video.course.videos.count()
        completed_videos = VideoProgress.objects.filter(
            user=user, video__course=video.course, is_completed=True
        ).count()
        
        progress.progress_percentage = (completed_videos / total_videos * 100) if total_videos > 0 else 0
        progress.save()

        return progress


    
class CourseProgressSerializer(serializers.Serializer):
    course_title = serializers.CharField(read_only=True)
    total_videos = serializers.IntegerField()
    completed_videos = serializers.IntegerField()
    progress_percentage = serializers.FloatField()

class VideoHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = ['video', 'progress_percentage', 'last_watched_position', 'is_completed', 'updated_at']


class StudentCourseSerializer(serializers.ModelSerializer):
    """
    Returns course details for students.
    Videos & resources are locked unless the student is enrolled.
    """
    videos = serializers.SerializerMethodField()
    resources = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'videos', 'resources']

    def get_videos(self, obj):
        """
        If the student is not enrolled, return locked videos.
        """
        is_enrolled = self.context.get("is_enrolled", False)
        if is_enrolled:
            return VideoSerializer(obj.videos.all(), many=True).data
        return [{"title": video.title, "locked": True} for video in obj.videos.all()]

    def get_resources(self, obj):
        """
        If the student is not enrolled, return locked resources.
        """
        is_enrolled = self.context.get("is_enrolled", False)
        if is_enrolled:
            return ResourceSerializer(obj.resources.all(), many=True).data
        return [{"title": resource.title, "locked": True} for resource in obj.resources.all()]


