from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import PersonalDashboardSerializer
from core.permissions import IsRegularUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

logger = logging.getLogger(__name__) #set up logger

class PersonalDashboardView(APIView):
    permission_classes = [IsRegularUser]
    @swagger_auto_schema(
        operation_description="Retrieve the personal dashboard details for the authenticated user.",
        responses={200: PersonalDashboardSerializer()}
    )

    def get(self, request):
        user = request.user
        logger.info(f"User accessing dashboard: {user}")  #Debugging log

        try:
            serializer = PersonalDashboardSerializer(user)
            logger.info(f"Serialized Data: {serializer.data}")  #Log response data
            return Response(serializer.data, status=200)
        except Exception as e:
            logger.error(f"Error in Dashboard API: {str(e)}", exc_info = True)  #Log the error
            return Response({"error": "Internal Server Error: {str(e)}"}, status=500)
