from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Note
from .serializers import NoteSerializer
from courses.models import Video
from core.permissions import IsRegularUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class StudentNotesView(APIView):
    permission_classes = [IsRegularUser]

    @swagger_auto_schema(
        operation_description="Retrieve all notes for a specific video.",
        responses={200: NoteSerializer(many=True)}
    )

    def get(self, request, video_id):
        video = get_object_or_404(Video, id=video_id)
        notes = Note.objects.filter(user=request.user, video=video)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Create a new note for a specific video.",
        request_body=NoteSerializer,
        responses={201: NoteSerializer()}
    )

    def post(self, request, video_id):
        video = get_object_or_404(Video, id=video_id)
        print(f"Video: {video}, User: {request.user}")
        serializer = NoteSerializer(data=request.data, context={'user': request.user, 'video': video})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(f"Errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class StudentEditNoteView(APIView):
    permission_classes = [IsRegularUser]

    @swagger_auto_schema(
        operation_description="Edit an existing note.",
        request_body=NoteSerializer,
        responses={200: NoteSerializer()}
    )
    def put(self, request, note_id):
        note = get_object_or_404(Note, id=note_id, user=request.user)
        serializer = NoteSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Delete a specific note.",
        responses={200: openapi.Response("Note deleted successfully")}
    )

    def delete(self, request, note_id):
        note = get_object_or_404(Note, id=note_id, user=request.user)
        note.delete()
        return Response({"message": "Note deleted successfully"}, status=status.HTTP_200_OK)

