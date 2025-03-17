# from django.contrib import admin
# from django.utils.html import format_html
# from courses.models import Course, Enrollment, VideoProgress
# from .models import AdminDashboard

# @admin.register(AdminDashboard)
# class AdminDashboardAdmin(admin.ModelAdmin):
#     """ Displays analytics for Admin Dashboard inside Django Admin. """
    
#     # list_display = ("dashboard_view",)  # ✅ Ensures it appears in admin panel

#     def dashboard_view(self, obj):
#         """ Custom method to display statistics inside Django Admin. """
        
#         total_courses = Course.objects.count()
#         total_enrollments = Enrollment.objects.count()
#         total_completed_videos = VideoProgress.objects.filter(is_completed=True).count()

#         return format_html(
#             f"""
#             <div style="padding:15px;">
#                 <h2 style="color:#2c3e50;">📊 Admin Dashboard</h2>
#                 <p><strong>Total Courses:</strong> {total_courses}</p>
#                 <p><strong>Total Enrollments:</strong> {total_enrollments}</p>
#                 <p><strong>Completed Videos:</strong> {total_completed_videos}</p>
#             </div>
#             """
#         )

#     dashboard_view.short_description = "Dashboard Statistics"

#     def has_add_permission(self, request):
#         return False  # ❌ Prevents adding new entries

#     def has_change_permission(self, request, obj=None):
#         return False  # ❌ Prevents editing

#     def has_delete_permission(self, request, obj=None):
#         return False  # ❌ Prevents deleting
