from rest_framework import serializers
from .models import InstituteProfile, CourseCategory, Course, Student, Enrollment, ContactMessage, SeasonalOffer


class InstituteProfileSerializer(serializers.ModelSerializer):
    years_of_experience = serializers.SerializerMethodField()
    
    class Meta:
        model = InstituteProfile
        fields = [
            'id', 'name', 'certification', 'founding_year', 'years_of_experience',
            'students_per_year', 'total_alumni', 'total_centers', 'tagline', 'about',
            'partners', 'email', 'phone', 'address'
        ]
    
    def get_years_of_experience(self, obj):
        from datetime import datetime
        return datetime.now().year - obj.founding_year


class CourseCategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseCategory
        fields = ['id', 'name', 'slug', 'description', 'duration_info', 'display_order', 'course_count']
    
    def get_course_count(self, obj):
        return obj.courses.filter(is_active=True).count()


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course list view (summary)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    formatted_fees = serializers.CharField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'category', 'category_name', 'category_slug',
            'duration', 'duration_months', 'fees', 'formatted_fees',
            'objective', 'description', 'is_featured'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer for course detail view (full details)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    formatted_fees = serializers.CharField(read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'category', 'category_name', 'category_slug',
            'duration', 'duration_months', 'fees', 'formatted_fees',
            'objective', 'description', 'target_audience', 'syllabus',
            'is_featured', 'enrollment_open', 'enrollment_count'
        ]
    
    def get_enrollment_count(self, obj):
        return obj.enrollments.filter(status__in=['approved', 'completed']).count()


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    enrolled_courses = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'date_of_birth', 'address', 'is_active', 'enrolled_courses'
        ]
    
    def get_enrolled_courses(self, obj):
        enrollments = obj.enrollments.filter(status__in=['approved', 'pending'])
        return EnrollmentSerializer(enrollments, many=True).data


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name', 'course_code',
            'enrollment_date', 'start_date', 'end_date', 'status',
            'payment_status', 'amount_paid', 'progress_percentage', 'remarks'
        ]
        read_only_fields = ['enrollment_date']


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new enrollments"""
    class Meta:
        model = Enrollment
        fields = ['student', 'course']
    
    def validate(self, data):
        # Check if student is already enrolled in this course
        if Enrollment.objects.filter(
            student=data['student'],
            course=data['course'],
            status__in=['pending', 'approved']
        ).exists():
            raise serializers.ValidationError("Student is already enrolled in this course")
        
        # Check if course enrollment is open
        if not data['course'].enrollment_open:
            raise serializers.ValidationError("Enrollment is not open for this course")
        
        return data


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']


class SeasonalOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeasonalOffer
        fields = ['id', 'title', 'message', 'is_active', 'priority', 'created_at']
