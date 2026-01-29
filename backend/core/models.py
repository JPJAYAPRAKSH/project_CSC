from django.db import models
from django.core.validators import MinValueValidator
import json


class InstituteProfile(models.Model):
    """Singleton model for institute information"""
    name = models.CharField(max_length=200, default="CSC Computer Software College")
    certification = models.CharField(max_length=200, default="ISO 9001:2015 Certified Institution")
    founding_year = models.IntegerField(default=1986)
    students_per_year = models.IntegerField(default=100000, help_text="Students trained per year")
    total_alumni = models.IntegerField(default=5000000, help_text="Total alumni base")
    total_centers = models.IntegerField(default=360)
    tagline = models.TextField(default="Empowering Careers Through Quality Education")
    about = models.TextField(blank=True)
    
    # Educational Partners
    partners = models.JSONField(default=list, help_text="List of educational partners")
    
    # Contact Information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Institute Profile"
        verbose_name_plural = "Institute Profile"
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and InstituteProfile.objects.exists():
            raise ValueError("Only one InstituteProfile instance is allowed")
        return super().save(*args, **kwargs)


class CourseCategory(models.Model):
    """Course categories like Diploma, Advanced Diploma, etc."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    duration_info = models.CharField(max_length=50, help_text="e.g., '6 Months', '4 Months', '1 Year'")
    display_order = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = "Course Category"
        verbose_name_plural = "Course Categories"
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.duration_info})"


class Course(models.Model):
    """Individual course details"""
    # Basic Information
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, help_text="e.g., DCA, ADAD, HDFD")
    category = models.ForeignKey(CourseCategory, on_delete=models.CASCADE, related_name='courses')
    
    # Course Details
    duration = models.CharField(max_length=50, help_text="e.g., '6 Months', '4 Months'")
    duration_months = models.IntegerField(validators=[MinValueValidator(1)])
    fees = models.DecimalField(max_digits=10, decimal_places=2, help_text="Course fees in INR")
    
    # Description
    objective = models.TextField(help_text="Course objective/goal")
    description = models.TextField(blank=True)
    target_audience = models.TextField(help_text="Who should take this course")
    
    # Syllabus stored as JSON
    syllabus = models.JSONField(default=dict, help_text="Course syllabus as structured JSON")
    
    # Additional Info
    is_featured = models.BooleanField(default=False, help_text="Show on homepage")
    is_active = models.BooleanField(default=True)
    enrollment_open = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        ordering = ['category__display_order', 'name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def formatted_fees(self):
        """Return formatted fees with currency"""
        return f"₹ {self.fees:,.2f}"


class Student(models.Model):
    """Student information"""
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    password = models.CharField(max_length=128, default='')  # Hashed password
    
    # Profile Details
    photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    instagram_url = models.URLField(max_length=500, blank=True)
    linkedin_url = models.URLField(max_length=500, blank=True)
    
    # Additional Info
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    bio = models.TextField(blank=True, help_text="Short bio or about me")
    
    # Account
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def set_password(self, raw_password):
        from django.contrib.auth.hashers import make_password
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)


class Enrollment(models.Model):
    """Track student course enrollments"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey('Batch', on_delete=models.SET_NULL, null=True, blank=True, related_name='enrollments')
    
    # Enrollment Details
    enrollment_date = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Payment
    payment_status = models.CharField(max_length=20, default='pending')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Progress
    progress_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Remarks
    remarks = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        ordering = ['-enrollment_date']
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.code}"


class ContactMessage(models.Model):
    """Store contact form submissions"""
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subject}"


class SeasonalOffer(models.Model):
    """Seasonal offers and announcements displayed in a marquee"""
    title = models.CharField(max_length=200, help_text="Internal title for the offer")
    message = models.TextField(help_text="The scrolling message text")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher priority offers show first")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Seasonal Offer"
        verbose_name_plural = "Seasonal Offers"
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return self.title


class Batch(models.Model):
    """Batches for courses"""
    name = models.CharField(max_length=100, help_text="e.g., 'Jan 2026 Morning Batch'")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='batches')
    time_slot = models.CharField(max_length=100, help_text="e.g., '10:00 AM - 12:00 PM'")
    start_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Batch"
        verbose_name_plural = "Batches"
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.name} ({self.course.code})"


class OTPVerification(models.Model):
    """Store OTPs for email/phone verification and password reset"""
    email = models.EmailField()
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, default='password_reset') # or 'login', 'registration'
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} - {self.code} ({self.purpose})"
