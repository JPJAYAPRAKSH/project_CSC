from django.contrib import admin
from django.shortcuts import render
from django.contrib import messages
from .models import InstituteProfile, CourseCategory, Course, Student, Enrollment, ContactMessage, SeasonalOffer, Batch
from .utils import send_professional_email, send_whatsapp_message


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


class BatchFilter(admin.SimpleListFilter):
    title = 'Batch'
    parameter_name = 'batch'

    def lookups(self, request, model_admin):
        batches = Batch.objects.all()
        return [(b.id, str(b)) for b in batches]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(enrollments__batch__id=self.value())
        return queryset


@admin.action(description='Send Email & WhatsApp to selected Students')
def send_email_and_whatsapp(modeladmin, request, queryset):
    # If request is POST and 'apply' is clicked (we can use an intermediate page for message content)
    # For simplicity, we'll check if a message has been provided in the POST,
    # otherwise render a form.
    
    if 'apply' in request.POST:
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        send_email = request.POST.get('send_email') == 'on'
        send_whatsapp = request.POST.get('send_whatsapp') == 'on'
        
        count = 0
        for student in queryset:
            if send_email and student.email:
                send_professional_email(subject, message, [student.email])
            
            if send_whatsapp and student.phone:
                # Assuming simple text message
                send_whatsapp_message(student.phone, message)
            
            count += 1
            
        modeladmin.message_user(request, f"Messages sent to {count} students.")
        return
        
    # Render intermediate page
    return render(request, 'admin/send_message_intermediate.html', context={'students': queryset})


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', BatchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering = ['-created_at']
    actions = [send_email_and_whatsapp]
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'photo', 'bio')
        }),
        ('Social Media', {
            'fields': ('instagram_url', 'linkedin_url')
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
    list_display = ['student', 'course', 'batch', 'status', 'enrollment_date', 'progress_percentage', 'payment_status']
    list_filter = ['status', 'payment_status', 'enrollment_date', 'course__category', 'batch']
    search_fields = ['student__first_name', 'student__last_name', 'student__email', 'course__name', 'course__code']
    ordering = ['-enrollment_date']
    
    fieldsets = (
        ('Enrollment Details', {
            'fields': ('student', 'course', 'batch', 'enrollment_date', 'start_date', 'end_date')
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


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'time_slot', 'start_date', 'is_active']
    list_filter = ['course', 'is_active', 'start_date']
    search_fields = ['name', 'course__name', 'course__code']
    ordering = ['-start_date']
