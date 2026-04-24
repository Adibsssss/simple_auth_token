from django.urls import path
from . import views

app_name = 'items'

urlpatterns = [
    path('',      views.item_list,   name='item-list'),    # GET, POST
    path('<int:pk>/', views.item_detail, name='item-detail'),  # GET, PUT, PATCH, DELETE
]
