from django.urls import path
from .views import ActiveUsersView, ActiveUsersSummaryView, CourseCompletionRateView, PlatformStatisticsView,StudentListAPIView,AdminResetStudentPasswordAPIView,DeleteStudentAPIView 
   
urlpatterns = [
    path('active-users/', ActiveUsersView.as_view(), name='active-users'),
    path('active-users-summary/', ActiveUsersSummaryView.as_view(), name='active-users-summary'),
    path('course-completion/', CourseCompletionRateView.as_view(), name='course-completion-rate'),
    path('platform-stats/', PlatformStatisticsView.as_view(), name='platform-statistics'),
    # path('users/', AdminUsersView.as_view(), name='admin-users'),

    path('students/', StudentListAPIView.as_view(), name='student-list'),
    path('students/<int:user_id>/delete/', DeleteStudentAPIView.as_view(), name='delete-student'),
    path('students/<int:user_id>/reset-password/', AdminResetStudentPasswordAPIView.as_view(), name='reset-student-password'),
]



