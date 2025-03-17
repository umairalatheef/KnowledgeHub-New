from django.db import models
from django.conf import settings
from django.utils.timezone import now
from core.s3_signed_url import generate_signed_url


def video_upload_path(instance, filename):
    return f"videos/course_{instance.course.id}/{filename}"

def resource_upload_path(instance, filename):
    # Ensure instance.course is set before using instance.course.id
    if not instance.course_id:
        raise ValueError("The 'course' field must be set before saving the resource.")
    return f"resources/course_{instance.course.id}/{filename}"

def course_image_upload_path(instance, filename):
    """Generate file path for course images in S3."""
    course_id = instance.pk or "new"
    return f"course_images/course_{course_id}/{filename}"

def video_thumbnail_upload_path(instance, filename):
    """Generate file path for video thumbnails in S3 or local storage."""
    return f"thumbnails/course_{instance.course.id}/{filename}"
   

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    created_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to= course_image_upload_path, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be earlier than start date.")

    def __str__(self):
        return self.title
    
    @property
    def image_url(self):
        """Return a signed S3 URL for the image"""
        if self.image:
            return generate_signed_url(f"media/{self.image.name}")  # Generate signed URL
        return None  # If no image, return None
    
class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_date = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title} on {self.enrolled_date}"
    

class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # Editable field for admins
    video_file = models.FileField(upload_to=video_upload_path)  # Files uploaded to 'videos/' folder in S3
    thumbnail = models.ImageField(upload_to=video_thumbnail_upload_path, null=True, blank=True)
    duration = models.PositiveIntegerField()  # Duration in seconds
    is_published = models.BooleanField(default=True)  # Admin can unpublish videos
    uploaded_at = models.DateTimeField(auto_now_add=True)


    def formatted_duration(self):
        hours, remainder = divmod(self.duration, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02}:{minutes:02}:{seconds:02}"

    def __str__(self):
        return f"{self.title} (Course: {self.course.title})"

    class Meta:
        ordering = ['uploaded_at']


class Resource(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=resource_upload_path)  #Files uploaded to 'resources/' folder in S3
    resource_type = models.CharField(
        max_length=50,
        choices=[('pdf', 'PDF'), ('word', 'Word Document'), ('powerpoint', 'PowerPoint Presentation'),('excel', 'Excel Spreadsheet'),('link', 'Link')],
        default='pdf'
    )
    download_count = models.PositiveIntegerField(default=0)  # Track number of downloads
    uploaded_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.title} (Course: {self.course.title})"

    class Meta:
        ordering = ['uploaded_at']

    def increment_download_count(self):
        # Increment the download count
        self.download_count += 1
        self.save()

class VideoProgress(models.Model):
    
    #Tracks a user's progress in a specific video.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_progress')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='progress')
    progress_percentage = models.FloatField(default=0.0)  #Between 0 and 100
    last_watched_position = models.PositiveIntegerField(default=0)  #In seconds
    is_completed = models.BooleanField(default=False)  #Tracks completion status
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'video')  #Ensure unique progress per user per video
        verbose_name = "Video Progress"
        verbose_name_plural = "Video Progress"

    def save(self, *args, **kwargs):
        #Automatically mark as completed if progress_percentage reaches 100.
        if self.progress_percentage == 100:
            self.is_completed = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.video.title} ({self.progress_percentage}%)"

