from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    # Public
    path('register/',        views.register_view,         name='register'),
    path('login/',           views.login_view,             name='login'),

    # Authenticated users
    path('logout/',          views.logout_view,            name='logout'),
    path('profile/',         views.profile_view,           name='profile'),
    path('change-password/', views.change_password_view,   name='change-password'),

    # Admin only
    path('users/',           views.user_list_view,         name='user-list'),
    path('users/<int:pk>/',  views.user_detail_view,       name='user-detail'),
]
