from django.contrib import admin
from .models import InstituteProfile, CourseCategory, Course, Student, Enrollment, ContactMessage, SeasonalOffer


@admin.register(InstituteProfile)
class InstituteProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'certification', 'founding_year', 'total_centers', 'students_per_year']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'certification', 'founding_year', 'tagline', 'about')
        }),
        ('Statistics', {
            'fields': ('students_per_year', 'total_alumni', 'total_centers')
        }),
        ('Partners & Contact', {
            'fields': ('partners', 'email', 'phone', 'address')
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not InstituteProfile.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion
        return False


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_info', 'display_order', 'course_count']
    list_editable = ['display_order']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'name']
    
    def course_count(self, obj):
        return obj.courses.count()
    course_count.short_description = 'Number of Courses'


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'duration', 'fees', 'is_featured', 'is_active', 'enrollment_open']
    list_filter = ['category', 'is_featured', 'is_active', 'enrollment_open']
    list_editable = ['is_featured', 'is_active', 'enrollment_open']
    search_fields = ['name', 'code', 'objective', 'description']
    ordering = ['category__display_order', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'category')
        }),
        ('Duration & Fees', {
            'fields': ('duration', 'duration_months', 'fees')
        }),
        ('Description', {
            'fields': ('objective', 'description', 'target_audience')
        }),
        ('Syllabus', {
            'fields': ('syllabus',),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('is_featured', 'is_active', 'enrollment_open')
        }),
    )


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'date_of_birth')
        }),
        ('Address', {
            'fields': ('address',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'enrollment_date', 'progress_percentage', 'payment_status']
    list_filter = ['status', 'payment_status', 'enrollment_date', 'course__category']
    search_fields = ['student__first_name', 'student__last_name', 'student__email', 'course__name', 'course__code']
    ordering = ['-enrollment_date']
    
    fieldsets = (
        ('Enrollment Details', {
            'fields': ('student', 'course', 'enrollment_date', 'start_date', 'end_date')
        }),
        ('Status', {
            'fields': ('status', 'progress_percentage')
        }),
        ('Payment', {
            'fields': ('payment_status', 'amount_paid')
        }),
        ('Remarks', {
            'fields': ('remarks',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['enrollment_date']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message', {
            'fields': ('subject', 'message')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
    )
    
    readonly_fields = ['created_at']
@admin.register(SeasonalOffer)
class SeasonalOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'created_at']
    list_editable = ['is_active', 'priority']
    search_fields = ['title', 'message']
    ordering = ['-priority', '-created_at']
