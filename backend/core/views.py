from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import InstituteProfile, CourseCategory, Course, Student, Enrollment, ContactMessage, SeasonalOffer
from .serializers import (
    InstituteProfileSerializer, CourseCategorySerializer,
    CourseListSerializer, CourseDetailSerializer,
    StudentSerializer, EnrollmentSerializer, EnrollmentCreateSerializer,
    ContactMessageSerializer, SeasonalOfferSerializer
)


class InstituteProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for institute profile information
    """
    queryset = InstituteProfile.objects.all()
    serializer_class = InstituteProfileSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current institute profile"""
        try:
            profile = InstituteProfile.objects.first()
            if profile:
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
            return Response(
                {"detail": "Institute profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CourseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for course categories
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for courses
    List view returns summary, detail view returns full course info
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'category__slug', 'is_featured', 'enrollment_open']
    search_fields = ['name', 'code', 'objective', 'description']
    ordering_fields = ['name', 'fees', 'duration_months']
    ordering = ['category__display_order', 'name']
    
    def get_queryset(self):
        return Course.objects.filter(is_active=True).select_related('category')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured courses"""
        courses = self.get_queryset().filter(is_featured=True)
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get courses grouped by category"""
        categories = CourseCategory.objects.all()
        result = []
        
        for category in categories:
            courses = self.get_queryset().filter(category=category)
            result.append({
                'category': CourseCategorySerializer(category).data,
                'courses': CourseListSerializer(courses, many=True).data
            })
        
        return Response(result)


class StudentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for students
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone']


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for enrollments
    """
    queryset = Enrollment.objects.all().select_related('student', 'course')
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'course', 'status', 'payment_status']
    ordering_fields = ['enrollment_date', 'progress_percentage']
    ordering = ['-enrollment_date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EnrollmentCreateSerializer
        return EnrollmentSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new enrollment"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create enrollment
        enrollment = serializer.save()
        
        # Return full enrollment details
        response_serializer = EnrollmentSerializer(enrollment)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get enrollments for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"detail": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollments = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for contact messages
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_read']
    ordering = ['-created_at']
    
    def create(self, request, *args, **kwargs):
        """Create a new contact message"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(
            {"detail": "Message sent successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )


class SeasonalOfferViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for seasonal offers
    """
    queryset = SeasonalOffer.objects.filter(is_active=True)
    serializer_class = SeasonalOfferSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the latest active offers"""
        offers = self.get_queryset()
        serializer = self.get_serializer(offers, many=True)
        return Response(serializer.data)
