from django.contrib import admin
from django.urls import path
from .models import Course, Video, Resource, VideoProgress, Enrollment

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'start_date', 'end_date', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    list_filter = ('start_date', 'end_date', 'created_at')
    date_hierarchy = 'start_date'
    ordering = ('-created_at',)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'duration', 'uploaded_at','is_published','description')
    search_fields = ('title', 'course__title')
    list_filter = ('is_published','uploaded_at',)
    ordering = ('-uploaded_at',)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'uploaded_at','download_count')
    search_fields = ('title', 'course__title')
    list_filter = ('uploaded_at',)
    ordering = ('-uploaded_at',)

@admin.register(VideoProgress)
class VideoProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'progress_percentage', 'last_watched_position', 'is_completed', 'updated_at')
    search_fields = ('user__username', 'video__title', 'video__course__title')
    list_filter = ('is_completed', 'updated_at')
    ordering = ('-updated_at',)
    list_per_page = 20  # Show 20 records per page

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_date')
    search_fields = ('user__username', 'course__title')
    list_filter = ('enrolled_date',)
    ordering = ('-enrolled_date',)
    list_per_page = 20  # Show 20 records per page
