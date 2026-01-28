from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer
from django.views.decorators.csrf import csrf_exempt


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
    Get current logged-in student info.
    """
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
