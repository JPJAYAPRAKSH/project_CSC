from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from .models import Student, OTPVerification
from .serializers import StudentSerializer
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import string


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
@csrf_exempt
def student_login(request):
    """
    Student login with email and password.
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        student = Student.objects.get(email__iexact=email)
        
        # Check password
        if not student.check_password(password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if active (Admin approval)
        if not student.is_active:
            return Response(
                {'error': 'Your account is pending admin approval. Please wait for the institution to verify your details.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Store student info in session
        request.session['student_id'] = student.id
        request.session['is_student'] = True
        request.session.save()
        
        serializer = StudentSerializer(student)
        return Response({
            'message': 'Login successful',
            'student': serializer.data,
            'session_key': request.session.session_key
        })
        
    except Student.DoesNotExist:
        # Try Admin/Staff Login
        user = authenticate(username=email, password=password) # Try email as username first
        if not user:
             # Try assuming email was actually a username
             user = authenticate(username=email, password=password)
             
        if user and (user.is_staff or user.is_superuser):
            django_login(request, user)
            request.session['is_admin'] = True
            request.session.save()
            return Response({
                'message': 'Admin login successful',
                'student': {
                    'id': user.id,
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'email': user.email,
                    'is_admin': True,
                    'is_active': True
                },
                'is_admin': True
            })

        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
@csrf_exempt
def student_register(request):
    """
    Register a new student account with email and password.
    """
    required_fields = ['first_name', 'last_name', 'email', 'password']
    
    for field in required_fields:
        if not request.data.get(field):
            return Response(
                {'error': f'{field.replace("_", " ").title()} is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    
    # Password validation
    if len(password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if student already exists
    if Student.objects.filter(email__iexact=email).exists():
        return Response(
            {'error': 'A student with this email already exists. Please login instead.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create student
        student = Student(
            first_name=request.data.get('first_name').strip(),
            last_name=request.data.get('last_name').strip(),
            email=email,
            phone=request.data.get('phone', '').strip(),
            date_of_birth=request.data.get('date_of_birth'),
            address=request.data.get('address', '')
        )
        student.set_password(password)
        student.is_active = False  # Ensure inactive by default
        student.save()
        
        # Registration successful, but needs admin approval - no auto-login
        
        serializer = StudentSerializer(student)
        return Response({
            'message': 'Registration successful. Your account is now pending admin approval from CSC administration.',
            'student': serializer.data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def student_logout(request):
    """
    Logout student by clearing session.
    """
    request.session.flush()
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_current_user(request):
    """
    Get current logged-in student or admin info.
    """
    # Check for Admin/Staff session
    if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
        return Response({
            'is_authenticated': True,
            'student': {
                'id': request.user.id,
                'first_name': 'Admin',
                'last_name': 'User',
                'email': request.user.email,
                'is_admin': True,
                'is_active': True
            },
            'is_admin': True
        })

    student_id = request.session.get('student_id')
    
    if not student_id:
        return Response({
            'is_authenticated': False,
            'student': None
        })
    
    try:
        student = Student.objects.get(id=student_id)
        serializer = StudentSerializer(student)
        return Response({
            'is_authenticated': True,
            'student': serializer.data
        })
    except Student.DoesNotExist:
        request.session.flush()
        return Response({
            'is_authenticated': False,
            'student': None
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """Generate and send OTP to student's email for password reset"""
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if student exists
    if not Student.objects.filter(email__iexact=email).exists():
        return Response({'error': 'No student found with this email'}, status=status.HTTP_404_NOT_FOUND)
    
    # Generate 6-digit OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    # Set expiry (10 minutes)
    expires_at = timezone.now() + timedelta(minutes=10)
    
    # Save to database
    OTPVerification.objects.create(
        email=email,
        code=otp_code,
        purpose='password_reset',
        expires_at=expires_at
    )
    
    # Send email (In real app, configure SMTP)
    try:
        subject = 'Password Reset OTP - CSC Computer Software College'
        message = f'Your verification code for password reset is: {otp_code}\n\nThis code will expire in 10 minutes.'
        email_from = settings.EMAIL_HOST_USER or 'noreply@csc.college'
        
        # Using fail_silently=False to catch configuration issues during dev
        send_mail(subject, message, email_from, [email], fail_silently=True)
        
        return Response({'message': 'OTP sent successfully to your email'})
    except Exception as e:
        return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify the OTP code provided by the user"""
    email = request.data.get('email', '').strip().lower()
    code = request.data.get('code', '').strip()
    
    if not email or not code:
        return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Look for the latest valid (non-expired, non-verified) OTP
    otp_record = OTPVerification.objects.filter(
        email=email,
        code=code,
        is_verified=False,
        expires_at__gt=timezone.now()
    ).first()
    
    if not otp_record:
        return Response({'error': 'Invalid or expired OTP code'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mark as verified
    otp_record.is_verified = True
    otp_record.save()
    
    return Response({'message': 'OTP verified successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Set a new password after successful OTP verification"""
    email = request.data.get('email', '').strip().lower()
    code = request.data.get('code', '').strip()
    new_password = request.data.get('new_password', '')
    
    if not email or not code or not new_password:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify that the OTP was actually verified in the previous step
    # For extra security, we check if there's a verified record for this email/code
    is_verified = OTPVerification.objects.filter(
        email=email,
        code=code,
        is_verified=True,
        created_at__gt=timezone.now() - timedelta(minutes=15) # Must be recent
    ).exists()
    
    if not is_verified:
        return Response({'error': 'Please verify your OTP first'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        student = Student.objects.get(email__iexact=email)
        student.set_password(new_password)
        student.save()
        
        # Log out from all sessions? (Optional but recommended)
        # Here we just clean up the OTP records for this email
        OTPVerification.objects.filter(email=email).delete()
        
        return Response({'message': 'Password has been reset successfully. You can now login.'})
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
