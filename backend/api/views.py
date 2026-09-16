from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health(request):
    """Liveness probe. Exists so the frontend -> Django wire can be verified."""
    return Response({'status': 'ok', 'service': 'carkingdom-api'})
