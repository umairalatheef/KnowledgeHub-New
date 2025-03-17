from django.urls import path
from .views import (
    CourseListCreateView, CourseDetailView, VideoListCreateView, ResourceListCreateView,
    AdminVideoProgressView,
    VideoDetailView, ResourceDetailView, StudentVideoProgressView,
    StudentCourseProgressView, StudentVideoHistoryView, StudentCourseDetailView, StudentVideoDetailView, StudentResourceDetailView,StudentCourseEnrollmentView,StudentEnrolledCoursesView, PublicCourseDetailView, PublicCourseListView
)

urlpatterns = [
    # Course-related endpoints
    path('', CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('<int:course_id>/videos/', VideoListCreateView.as_view(), name='video-list-create'),
    path('<int:course_id>/resources/', ResourceListCreateView.as_view(), name='resource-list-create'),

    # Admin features
    path('admin/<int:course_id>/videos/<int:video_id>/progress/', AdminVideoProgressView.as_view(), name='admin-video-progress'),
    # path('admin/video/<int:video_id>/edit/', VideoEditView.as_view(), name='video-edit'),

    #Make Video & Resource Details accessible for Admins
    path('<int:course_id>/videos/<int:video_id>/', VideoDetailView.as_view(), name='video-detail'),
    path('<int:course_id>/resources/<int:resource_id>/', ResourceDetailView.as_view(), name='resource-detail'),

    # Student features
    path('student/<int:course_id>/enroll/', StudentCourseEnrollmentView.as_view(), name='student-enroll-course'),
    path('student/enrolled/', StudentEnrolledCoursesView.as_view(), name='student-enrolled-course-list'),

    #Student Video & Resource Access (Only If Enrolled)
    path('student/enrolled/<int:course_id>/', StudentCourseDetailView.as_view(), name='student-course-detail'),
    path('student/<int:course_id>/videos/<int:video_id>/', StudentVideoDetailView.as_view(), name='student-video-detail'),
    path('student/<int:course_id>/resources/<int:resource_id>/', StudentResourceDetailView.as_view(), name='student-resource-detail'),

    #Student Video Progress
    path('student/<int:course_id>/videos/<int:video_id>/progress/', StudentVideoProgressView.as_view(), name='student-track-video-progress'),
    path('student/<int:course_id>/progress/', StudentCourseProgressView.as_view(), name='student-course-progress'),
    path('student/<int:course_id>/history/', StudentVideoHistoryView.as_view(), name='student-video-history'),
    # path('student/<int:course_id>/resource_download/<int:resource_id>/', ResourceDetailView.as_view(), name='resource-download'),

    #Public APIs
    path('public/', PublicCourseListView.as_view(), name="public-course-list"),
    path('public/<int:course_id>/', PublicCourseDetailView.as_view(), name="public-course-detail"),

  
]