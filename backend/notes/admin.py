from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'content', 'timestamp', 'updated_at')
    search_fields = ('user__username', 'video__title', 'content')
    list_filter = ('timestamp', 'updated_at')
    ordering = ('-timestamp',)

