import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEnrollmentsByStudent } from '../services/api';
import './StudentPortal.css';

function StudentPortal() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchEnrollments();
        }
    }, [user]);

    const fetchEnrollments = async () => {
        try {
            const response = await getEnrollmentsByStudent(user.id);
            setEnrollments(response.data);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-portal-page">
            <div className="portal-header">
                <div className="container">
                    <div className="welcome-section">
                        <div className="welcome-avatar">
                            {user?.photo ? (
                                <img src={user.photo} alt="Profile" className="avatar-img" />
                            ) : (
                                <span>{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</span>
                            )}
                        </div>
                        <div className="welcome-text">
                            <h1>Welcome back, {user?.first_name}!</h1>
                            <p>Manage your courses, view certificates, and track your progress</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container portal-content">
                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-info">
                            <span className="stat-number">{enrollments.length}</span>
                            <span className="stat-label">Enrolled Courses</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📜</div>
                        <div className="stat-info">
                            <span className="stat-number">
                                {enrollments.filter(e => e.status === 'completed').length}
                            </span>
                            <span className="stat-label">Certificates</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <span className="stat-number">
                                {enrollments.length > 0
                                    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress_percentage, 0) / enrollments.length)
                                    : 0}%
                            </span>
                            <span className="stat-label">Avg Progress</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <span className="stat-number">
                                {enrollments.filter(e => e.status === 'approved').length}
                            </span>
                            <span className="stat-label">Active Courses</span>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="features-section">
                    <h2>Portal Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📜</div>
                            <h3>E-Certificates</h3>
                            <p>Download your verified course completion certificates</p>
                            <button className="btn btn-primary btn-sm">View Certificates</button>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">✅</div>
                            <h3>Verified Remarks</h3>
                            <p>View your performance feedback and instructor remarks</p>
                            <button className="btn btn-primary btn-sm">View Remarks</button>
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses List */}
                {enrollments.length > 0 && (
                    <div className="enrollments-section">
                        <h2>My Enrolled Courses</h2>
                        <div className="enrollments-list">
                            {enrollments.map((enrollment) => (
                                <div className="enrollment-card" key={enrollment.id}>
                                    <div className="enrollment-info">
                                        <h4>{enrollment.course_name || 'Course'}</h4>
                                        <span className={`status-badge status-${enrollment.status}`}>
                                            {enrollment.status}
                                        </span>
                                    </div>
                                    {enrollment.batch_name && (
                                        <div className="batch-badge">
                                            🗓️ Batch: {enrollment.batch_name} ({enrollment.batch_time})
                                        </div>
                                    )}
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${enrollment.progress_percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">{enrollment.progress_percentage}% Complete</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Profile Section - Now just a card with Update button */}
                <div className="profile-section" style={{ marginTop: '3rem' }}>
                    <h2>Your Profile</h2>
                    <div className="profile-card-container">
                        <div className="profile-card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
                            <div className="profile-avatar large">
                                {user?.photo ? (
                                    <img src={user.photo} alt="Profile" />
                                ) : (
                                    <span>{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="profile-details" style={{ flex: 1 }}>
                                <h3>{user?.first_name} {user?.last_name}</h3>
                                <p><strong>Email:</strong> {user?.email}</p>
                                <p><strong>Phone:</strong> {user?.phone || 'Not set'}</p>
                                {user?.bio && <p><strong>Bio:</strong> {user.bio}</p>}
                                <div style={{ marginTop: '1rem' }}>
                                    <Link to="/update-profile" className="btn btn-primary">
                                        ✏️ Update Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentPortal;
