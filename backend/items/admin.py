from django.contrib import admin
from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'quantity', 'price', 'created_by', 'created_at']
    search_fields = ['name', 'description']
    list_filter   = ['created_by', 'created_at']
