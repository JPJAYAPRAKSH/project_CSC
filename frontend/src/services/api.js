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

// Course Categories
export const getCategories = () => api.get('/categories/');

// Courses
export const getCourses = (params = {}) => api.get('/courses/', { params });
export const getCourseById = (id) => api.get(`/courses/${id}/`);
export const getFeaturedCourses = () => api.get('/courses/featured/');
export const getCoursesByCategory = () => api.get('/courses/by_category/');

// Enrollments
export const createEnrollment = (data) => api.post('/enrollments/', data);
export const getEnrollmentsByStudent = (studentId) =>
    api.get('/enrollments/by_student/', { params: { student_id: studentId } });

// Contact
export const sendContactMessage = (data) => api.post('/contact/', data);

export default api;
