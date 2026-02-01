import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Institute Profile
export const getInstituteProfile = () => api.get('/institute/current/');

// Auth
export const login = (data) => api.post('/auth/login/', data);
export const register = (data) => api.post('/auth/register/', data);
export const logout = () => api.post('/auth/logout/');
export const getCurrentUser = () => api.get('/auth/me/');
export const requestOTP = (data) => api.post('/auth/request-otp/', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp/', data);
export const resetPassword = (data) => api.post('/auth/reset-password/', data);

// Course Categories
export const getCategories = () => api.get('/categories/');

// Courses
export const getCourses = (params = {}) => api.get('/courses/', { params });
export const getCourseById = (id) => api.get(`/courses/${id}/`);
export const getFeaturedCourses = () => api.get('/courses/featured/');
export const getCoursesByCategory = () => api.get('/courses/by_category/');

// Students
export const updateStudentProfile = (id, data) => {
    // Use FormData for photo upload
    const formData = new FormData();
    for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    }
    return api.patch(`/students/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const exportStudentsCSV = (params = {}) =>
    api.get('/students/export_csv/', { params, responseType: 'blob' });

export const sendBulkMessage = (data) => api.post('/students/send_bulk_message/', data);

// Batches
export const getBatches = (params = {}) => api.get('/batches/', { params });
export const createBatch = (data) => api.post('/batches/', data);
export const updateBatch = (id, data) => api.patch(`/batches/${id}/`, data);

// Enrollments
export const createEnrollment = (data) => api.post('/enrollments/', data);
export const getEnrollmentsByStudent = (studentId) =>
    api.get('/enrollments/by_student/', { params: { student_id: studentId } });

// Contact
export const sendContactMessage = (data) => api.post('/contact/', data);

// Assessments
export const getAssessments = (params = {}) => api.get('/assessments/', { params });
export const getAssessmentById = (id) => api.get(`/assessments/${id}/`);
export const getAssessmentsForStudent = (studentId) =>
    api.get('/assessments/for_student/', { params: { student_id: studentId } });
export const getAssessmentsByCourse = (courseId) =>
    api.get('/assessments/by_course/', { params: { course_id: courseId } });

// Assessment Submissions
export const startAssessment = (data) => api.post('/submissions/start/', data);
export const saveAssessmentProgress = (submissionId, data) =>
    api.post(`/submissions/${submissionId}/save_progress/`, data);
export const executeCode = (submissionId, data) =>
    api.post(`/submissions/${submissionId}/execute/`, data);
export const submitAssessment = (submissionId, data) =>
    api.post(`/submissions/${submissionId}/submit/`, data);
export const getSubmissionsByStudent = (studentId) =>
    api.get('/submissions/by_student/', { params: { student_id: studentId } });

// Certificates
export const getCertificates = (params = {}) => api.get('/certificates/', { params });
export const getCertificatesByStudent = (studentId) =>
    api.get('/certificates/by_student/', { params: { student_id: studentId } });

// Payments
export const getPayments = (params = {}) => api.get('/payments/', { params });
export const getPaymentsByStudent = (studentId) =>
    api.get('/payments/by_student/', { params: { student_id: studentId } });

// Attendance
export const getAttendanceByStudent = (studentId) =>
    api.get('/attendance/by_student/', { params: { student_id: studentId } });

export { api };
export default api;
