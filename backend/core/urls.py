from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InstituteProfileViewSet, CourseCategoryViewSet, CourseViewSet,
    StudentViewSet, EnrollmentViewSet, ContactMessageViewSet, SeasonalOfferViewSet
)
from .auth_views import student_login, student_register, student_logout, get_current_user

# Create router and register viewsets
router = DefaultRouter()
router.register(r'institute', InstituteProfileViewSet, basename='institute')
router.register(r'categories', CourseCategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'offers', SeasonalOfferViewSet, basename='offer')

urlpatterns = [
    path('', include(router.urls)),
    # Auth endpoints
    path('auth/login/', student_login, name='student-login'),
    path('auth/register/', student_register, name='student-register'),
    path('auth/logout/', student_logout, name='student-logout'),
    path('auth/me/', get_current_user, name='current-user'),
]

