from django.urls import path
from .views import PersonalDashboardView
from courses.views import StudentEnrolledCoursesView

urlpatterns = [
    path('overview/', PersonalDashboardView.as_view(), name='personal-dashboard'),
   
]
