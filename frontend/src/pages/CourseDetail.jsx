import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../services/api';
import './CourseDetail.css';

function CourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await getCourseById(id);
            setCourse(response.data);
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container section">
                <div className="error-message">
                    <h2>Course not found</h2>
                    <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="course-detail">
            <div className="course-header">
                <div className="container">
                    <Link to="/courses" className="back-link">← Back to Courses</Link>
                    <div className="header-content">
                        <div className="header-badges">
                            <span className="badge">{course.category_name}</span>
                            <span className="code-badge">{course.code}</span>
                        </div>
                        <h1>{course.name}</h1>
                        <p className="course-objective">{course.objective}</p>
                    </div>
                </div>
            </div>

            <div className="container section">
                <div className="course-content">
                    <div className="main-content">
                        {/* Course Info Cards */}
                        <div className="info-cards">
                            <div className="info-card">
                                <div className="info-icon">⏱️</div>
                                <div className="info-details">
                                    <div className="info-label">Duration</div>
                                    <div className="info-value">{course.duration}</div>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon">💰</div>
                                <div className="info-details">
                                    <div className="info-label">Course Fee</div>
                                    <div className="info-value">{course.formatted_fees}</div>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon">👥</div>
                                <div className="info-details">
                                    <div className="info-label">Enrolled</div>
                                    <div className="info-value">{course.enrollment_count || 0} Students</div>
                                </div>
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div className="content-section">
                            <h2>Who Should Enroll?</h2>
                            <p>{course.target_audience}</p>
                        </div>

                        {/* Description */}
                        {course.description && (
                            <div className="content-section">
                                <h2>Course Description</h2>
                                <p>{course.description}</p>
                            </div>
                        )}

                        {/* Syllabus */}
                        {course.syllabus && course.syllabus.modules && (
                            <div className="content-section">
                                <h2>Course Syllabus</h2>
                                <div className="syllabus-modules">
                                    {course.syllabus.modules.map((module, index) => (
                                        <div key={index} className="module-card">
                                            <h3 className="module-title">
                                                <span className="module-number">{index + 1}</span>
                                                {module.title}
                                            </h3>
                                            <ul className="module-topics">
                                                {module.topics.map((topic, topicIndex) => (
                                                    <li key={topicIndex}>{topic}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar">
                        <div className="enroll-card">
                            <h3>Ready to Enroll?</h3>
                            <div className="price-display">
                                <div className="price-label">Course Fee</div>
                                <div className="price-amount">{course.formatted_fees}</div>
                            </div>
                            {course.enrollment_open ? (
                                <>
                                    <Link to="/contact" className="btn btn-primary" style={{ width: '100%' }}>
                                        Enroll Now
                                    </Link>
                                    <p className="enroll-note">Contact us to complete your enrollment</p>
                                </>
                            ) : (
                                <div className="enrollment-closed">
                                    <p>Enrollment currently closed</p>
                                </div>
                            )}
                        </div>

                        <div className="features-card">
                            <h4>Course Features</h4>
                            <ul className="features-list">
                                <li>✓ Expert Instructors</li>
                                <li>✓ Hands-on Projects</li>
                                <li>✓ Industry-Relevant Curriculum</li>
                                <li>✓ Certificate on Completion</li>
                                <li>✓ Lifetime Access to Materials</li>
                                <li>✓ Career Support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;
