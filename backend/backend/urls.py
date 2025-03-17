from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger Schema
schema_view_v1 = get_schema_view(
    openapi.Info(
        title="KnowledgeHub LMS Backend APIs (v1)",
        default_version="v1",
        description="API documentation for KnowledgeHub LMS - Version 1",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="knowledgehub.api@gmail.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('userauths.urls')),
    path('api/v1/courses/', include('courses.urls')),
    path('api/v1/notes/', include('notes.urls')),
    path('api/v1/student_dashboard/', include('student_dashboard.urls')),
    path('api/v1/notifications/', include('notifications.urls')),  # Added notification paths
    path('api/v1/admin_dashboard/', include('admin_dashboard.urls')),

     # Swagger Documentation URLs
    re_path(r"^swagger/v1(?P<format>\.json|\.yaml)/$", schema_view_v1.without_ui(cache_timeout=0), name="schema-json"),
    path("swagger/v1/", schema_view_v1.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui-v1"),
    path("redoc/v1/", schema_view_v1.with_ui("redoc", cache_timeout=0), name="schema-redoc-v1"),
]
