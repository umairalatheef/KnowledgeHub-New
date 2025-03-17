from django.urls import path
from .views import NotificationListView, MarkAsReadView, UpdateNotificationView, AdminCreateNotificationView, StudentRelevantNotificationsView, AdminSendNotificationView

urlpatterns = [
    path('list/', NotificationListView.as_view(), name='notification_list'),
    path('mark_read/<uuid:notification_uuid>/', MarkAsReadView.as_view(), name='mark_notification_read'),
    path('update/<uuid:notification_uuid>/', UpdateNotificationView.as_view(), name='update_notification'),
    path('admin/send/', AdminCreateNotificationView.as_view(), name='send_notification'), #For course specific notifications
    path('student/relevant/', StudentRelevantNotificationsView.as_view(), name='student_relevant_notifications'),
    path('admin/global_send/', AdminSendNotificationView.as_view(), name='admin_send_notification'), #For global notifications
]
