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

export { api };
export default api;
