from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Item
from .serializers import ItemSerializer


# ─────────────────────────────────────────────
#  GET  /api/items/        → list all items
#  POST /api/items/        → create new item
# ─────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def item_list(request):

    # LIST
    if request.method == 'GET':
        items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response({
            'success': True,
            'count': items.count(),
            'items': serializer.data
        }, status=status.HTTP_200_OK)

    # CREATE
    if request.method == 'POST':
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response({
                'success': True,
                'message': 'Item created successfully.',
                'item': serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'message': 'Validation failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
#  GET    /api/items/<id>/ → retrieve one item
#  PUT    /api/items/<id>/ → full update
#  PATCH  /api/items/<id>/ → partial update
#  DELETE /api/items/<id>/ → delete
# ─────────────────────────────────────────────
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def item_detail(request, pk):
    item = get_object_or_404(Item, pk=pk)

    # RETRIEVE
    if request.method == 'GET':
        serializer = ItemSerializer(item)
        return Response({
            'success': True,
            'item': serializer.data
        }, status=status.HTTP_200_OK)

    # FULL UPDATE
    if request.method == 'PUT':
        serializer = ItemSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Item updated successfully.',
                'item': serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Validation failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # PARTIAL UPDATE
    if request.method == 'PATCH':
        serializer = ItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Item partially updated.',
                'item': serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Validation failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # DELETE — admin (staff/superuser) only
    if request.method == 'DELETE':
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({
                'success': False,
                'message': 'Permission denied. Only administrators can delete items.'
            }, status=status.HTTP_403_FORBIDDEN)

        item_name = item.name
        item.delete()
        return Response({
            'success': True,
            'message': f'Item "{item_name}" deleted successfully.'
        }, status=status.HTTP_200_OK)
