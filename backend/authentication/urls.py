from django.urls import path
from . import views

app_name = 'authentication'
urlpatterns = [
    # Admin-only: full user list with department info
    path('users/',          views.user_list_view,   name='user-list'),
    # Admin-only: get / update / delete a specific user (with department support)
    path('users/<int:pk>/', views.user_detail_view, name='user-detail'),
]