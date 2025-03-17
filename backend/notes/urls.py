from django.urls import path
from .views import StudentNotesView,StudentEditNoteView

urlpatterns = [
    #Student routes
    path('student/video/<int:video_id>/notes/', StudentNotesView.as_view(), name='student-notes'),
    # path('student/note/<int:note_id>/', StudentNotesView.as_view(), name='student-delete-note'),
    path('student/note/<int:note_id>/', StudentEditNoteView.as_view(), name='student-edit-note'),
]
