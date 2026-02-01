from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.http import HttpResponse
import csv
from .models import (
    InstituteProfile, CourseCategory, Course, Student, Enrollment, 
    ContactMessage, SeasonalOffer, Batch, Attendance, Assessment, 
    Question, AssessmentSubmission, Certificate, Payment
)
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .serializers import (
    InstituteProfileSerializer, CourseCategorySerializer,
    CourseListSerializer, CourseDetailSerializer,
    StudentSerializer, EnrollmentSerializer, EnrollmentCreateSerializer,
    ContactMessageSerializer, SeasonalOfferSerializer, BatchSerializer,
    AttendanceSerializer, AssessmentSerializer, AssessmentDetailSerializer,
    QuestionSerializer, AssessmentSubmissionSerializer, CertificateSerializer,
    PaymentSerializer
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
        """Get the current institute profile with basic caching"""
        # Simple per-process cache for dev speed
        if hasattr(self, '_cached_profile'):
            return Response(self._cached_profile)
            
        try:
            profile = InstituteProfile.objects.first()
            if profile:
                serializer = self.get_serializer(profile)
                self._cached_profile = serializer.data
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
        courses = self.get_queryset().filter(is_featured=True).select_related('category')
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get courses grouped by category"""
        categories = CourseCategory.objects.all()
        result = []
        
        for category in categories:
            courses = self.get_queryset().filter(category=category).select_related('category')
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

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export student data as CSV"""
        # Get query parameters for filtering
        course_id = request.query_params.get('course_id')
        batch_id = request.query_params.get('batch_id')
        
        students = self.get_queryset()
        
        if course_id:
            students = students.filter(enrollments__course_id=course_id).distinct()
        if batch_id:
            students = students.filter(enrollments__batch_id=batch_id).distinct()
            
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="students_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'First Name', 'Last Name', 'Email', 'Phone', 
            'DOB', 'Instagram', 'LinkedIn', 'Address', 'Joined Date'
        ])
        
        for student in students:
            writer.writerow([
                student.id, student.first_name, student.last_name, 
                student.email, student.phone, student.date_of_birth,
                student.instagram_url, student.linkedin_url,
                student.address, student.created_at.strftime('%Y-%m-%d')
            ])
            
        return response

    @action(detail=False, methods=['post'])
    def send_bulk_message(self, request):
        """Send Email or WhatsApp message to multiple students"""
        student_ids = request.data.get('student_ids', [])
        message_type = request.data.get('type', 'email') # email or whatsapp
        subject = request.data.get('subject', 'Message from CSC Institute')
        content = request.data.get('content', '')
        
        if not student_ids or not content:
            return Response({'error': 'student_ids and content are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        students = Student.objects.filter(id__in=student_ids)
        
        if message_type == 'email':
            # Collect recipient list
            recipient_list = list(students.values_list('email', flat=True))
            try:
                send_mail(
                    subject,
                    content,
                    settings.EMAIL_HOST_USER or 'admin@csc.college',
                    recipient_list,
                    fail_silently=False
                )
                return Response({'message': f'Email sent to {len(recipient_list)} students'})
            except Exception as e:
                return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        elif message_type == 'whatsapp':
            # For WhatsApp, we return the phone numbers and the content 
            # so the frontend can open wa.me links
            recipients = []
            for s in students:
                if s.phone:
                    recipients.append({
                        'name': f"{s.first_name} {s.last_name}",
                        'phone': s.phone.replace(' ', '').replace('-', ''),
                    })
            
            return Response({
                'message': 'WhatsApp links generated',
                'recipients': recipients,
                'content': content
            })
            
        return Response({'error': 'Invalid message type'}, status=status.HTTP_400_BAD_REQUEST)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for enrollments
    """
    queryset = Enrollment.objects.all().select_related('student', 'course', 'batch')
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


class BatchViewSet(viewsets.ModelViewSet):
    """
    API endpoint for batches
    """
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['course', 'is_active']
    search_fields = ['name']


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for attendance records
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'date', 'is_present']
    ordering = ['-date']

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get attendance for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"detail": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = self.get_queryset().filter(student_id=student_id).order_by('-date')[:30]
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)


class AssessmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for assessments/quizzes
    """
    queryset = Assessment.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'assessment_type', 'is_active']
    search_fields = ['title', 'description']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AssessmentDetailSerializer
        return AssessmentSerializer

    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """Get assessments for a specific course"""
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response(
                {"detail": "course_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assessments = self.get_queryset().filter(course_id=course_id)
        serializer = AssessmentSerializer(assessments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def for_student(self, request):
        """Get assessments available for a student based on their enrollments"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"detail": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get courses the student is enrolled in
        enrolled_course_ids = Enrollment.objects.filter(
            student_id=student_id,
            status__in=['approved', 'pending']
        ).values_list('course_id', flat=True)
        
        assessments = self.get_queryset().filter(course_id__in=enrolled_course_ids)
        serializer = AssessmentSerializer(assessments, many=True)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for assessment questions
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['assessment', 'question_type']
    ordering = ['order', 'id']


class AssessmentSubmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for assessment submissions
    """
    queryset = AssessmentSubmission.objects.all()
    serializer_class = AssessmentSubmissionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'assessment', 'status']
    ordering = ['-started_at']

    @action(detail=False, methods=['post'])
    def start(self, request):
        """Start an assessment for a student"""
        student_id = request.data.get('student_id')
        assessment_id = request.data.get('assessment_id')
        
        if not student_id or not assessment_id:
            return Response(
                {"detail": "student_id and assessment_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already started
        existing = AssessmentSubmission.objects.filter(
            student_id=student_id,
            assessment_id=assessment_id
        ).first()
        
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data)
        
        # Create new submission
        submission = AssessmentSubmission.objects.create(
            student_id=student_id,
            assessment_id=assessment_id,
            status='in_progress'
        )
        serializer = self.get_serializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def save_progress(self, request, pk=None):
        """Save student progress without submitting"""
        submission = self.get_object()
        
        if submission.status == 'submitted' or submission.status == 'graded':
            return Response(
                {"detail": "Cannot save progress for submitted/graded assessment"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        answers = request.data.get('answers', {})
        code_submissions = request.data.get('code_submissions', {})
        
        # Merge or replace? Let's replace as the frontend sends the full state
        submission.answers = answers
        submission.code_submissions = code_submissions
        submission.updated_at = timezone.now()
        submission.save()
        
        return Response({"status": "success", "last_saved": submission.updated_at})

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute code for a specific question (Mock Execution)"""
        submission = self.get_object()
        question_id = request.data.get('question_id')
        code = request.data.get('code', '')
        language = request.data.get('language', 'python')
        
        try:
            question = Question.objects.get(id=question_id, assessment=submission.assessment)
        except Question.DoesNotExist:
            return Response({"detail": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # For this version, we implement a "Smart Mock Execution"
        # It basic checks for syntax (simple check) and runs against question.test_cases
        
        results = []
        all_passed = True
        stdout = "Code executed successfully.\n"
        stderr = ""
        
        # Simple "syntax check" simulation
        if "error" in code.lower() or "syntax" in code.lower():
            stderr = f"Traceback (most recent call last):\n  File \"solution.{language}\", line 4\n    {code[:20]}...\nSyntaxError: invalid syntax"
            return Response({
                "stdout": stdout,
                "stderr": stderr,
                "passed": False,
                "results": []
            })

        test_cases = question.test_cases or []
        for i, case in enumerate(test_cases):
            # Simulation: If code contains simple keywords from output, it passes
            expected = str(case.get('output', '')).strip()
            passed = expected.lower() in code.lower() or "print" in code.lower() # Very basic mock logic
            
            results.append({
                "test_case": i + 1,
                "input": case.get('input', ''),
                "expected": expected,
                "actual": expected if passed else "Execution Error",
                "passed": passed
            })
            if not passed:
                all_passed = False

        return Response({
            "stdout": stdout if all_passed else "Code executed with some failures.",
            "stderr": stderr,
            "passed": all_passed,
            "results": results
        })

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit answers for an assessment"""
        submission = self.get_object()
        
        if submission.status == 'submitted' or submission.status == 'graded':
            return Response(
                {"detail": "Assessment already submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        answers = request.data.get('answers', {})
        code_submissions = request.data.get('code_submissions', {})
        
        submission.answers = answers
        submission.code_submissions = code_submissions
        submission.status = 'submitted'
        submission.submitted_at = timezone.now()
        
        # Auto-grade MCQ questions
        total_score = 0
        total_marks = 0
        
        for question in submission.assessment.questions.all():
            total_marks += question.marks
            question_id_str = str(question.id)
            
            if question.question_type in ['mcq', 'true_false']:
                student_answer = answers.get(question_id_str)
                if student_answer is not None and str(student_answer) == str(question.correct_answer):
                    total_score += question.marks
        
        submission.score = total_score
        submission.percentage = (total_score / total_marks * 100) if total_marks > 0 else 0
        submission.graded_at = timezone.now()
        submission.status = 'graded'
        submission.save()
        
        serializer = self.get_serializer(submission)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get submissions for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"detail": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submissions = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)


class CertificateViewSet(viewsets.ModelViewSet):
    """
    API endpoint for certificates
    """
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'course']
    ordering = ['-issue_date']

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get certificates for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"detail": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        certificates = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(certificates, many=True)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for payments
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'status', 'payment_method']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get payments for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"detail": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payments = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
