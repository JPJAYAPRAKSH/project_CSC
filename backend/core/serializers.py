from rest_framework import serializers
from .models import (
    InstituteProfile, CourseCategory, Course, Student, Enrollment, 
    ContactMessage, SeasonalOffer, Batch, Attendance, Assessment, 
    Question, AssessmentSubmission, Certificate, Payment
)


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
    
    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'photo', 'instagram_url', 'linkedin_url', 'bio',
            'date_of_birth', 'address', 'is_active'
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    batch_time = serializers.CharField(source='batch.time_slot', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name', 'course_code',
            'batch', 'batch_name', 'batch_time',
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


class BatchSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Batch
        fields = [
            'id', 'name', 'course', 'course_name', 'course_code',
            'time_slot', 'start_date', 'is_active', 'student_count', 'created_at'
        ]
        read_only_fields = ['created_at']
        
    def get_student_count(self, obj):
        return obj.enrollments.count()


# New Serializers for Enhanced Features

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'date', 'is_present',
            'check_in_time', 'check_out_time', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id', 'assessment', 'question_text', 'question_type', 'marks',
            'options', 'correct_answer', 'explanation', 'code_template',
            'test_cases', 'order'
        ]


class QuestionListSerializer(serializers.ModelSerializer):
    """Serializer for students taking assessment - hides correct answer"""
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'marks',
            'options', 'code_template', 'order'
        ]


class AssessmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = [
            'id', 'title', 'description', 'course', 'course_name',
            'assessment_type', 'duration_minutes', 'total_marks', 'passing_marks',
            'is_active', 'auto_generated', 'start_datetime', 'end_datetime',
            'question_count', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_question_count(self, obj):
        return obj.questions.count()


class AssessmentDetailSerializer(AssessmentSerializer):
    """Full assessment with questions for taking the test"""
    questions = QuestionListSerializer(many=True, read_only=True)
    
    class Meta(AssessmentSerializer.Meta):
        fields = AssessmentSerializer.Meta.fields + ['questions']


class AssessmentSubmissionSerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    
    class Meta:
        model = AssessmentSubmission
        fields = [
            'id', 'student', 'student_name', 'assessment', 'assessment_title',
            'answers', 'code_submissions', 'score', 'percentage', 'status',
            'started_at', 'submitted_at', 'graded_at'
        ]
        read_only_fields = ['started_at', 'score', 'percentage', 'graded_at']


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name',
            'enrollment', 'certificate_number', 'issue_date', 'grade',
            'remarks', 'certificate_file', 'created_at'
        ]
        read_only_fields = ['certificate_number', 'issue_date', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_name = serializers.CharField(source='enrollment.course.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'enrollment', 'course_name',
            'amount', 'payment_method', 'status', 'transaction_id',
            'razorpay_order_id', 'razorpay_payment_id', 'receipt_number',
            'notes', 'created_at', 'completed_at'
        ]
        read_only_fields = ['transaction_id', 'receipt_number', 'created_at', 'completed_at']
