import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getEnrollmentsByStudent, api } from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [currentStreak, setCurrentStreak] = useState(0);

    const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
        queryKey: ['enrollments', user?.id],
        queryFn: async () => {
            const res = await getEnrollmentsByStudent(user.id);
            return res.data || [];
        },
        enabled: !!user?.id
    });

    const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
        queryKey: ['attendance', user?.id],
        queryFn: async () => {
            const res = await api.get(`/students/${user.id}/attendance/`).catch(() => ({ data: [] }));
            return res.data || [];
        },
        enabled: !!user?.id,
        onSuccess: (data) => calculateStreak(data)
    });

    // Calculate streak whenever attendance data changes
    useEffect(() => {
        if (attendance.length > 0) {
            calculateStreak(attendance);
        }
    }, [attendance]);

    const calculateStreak = (attendanceData) => {
        if (!attendanceData || !attendanceData.length) {
            setCurrentStreak(0);
            return;
        }
        // Calculate consecutive days present
        let streak = 0;
        const today = new Date();
        const sortedAttendance = [...attendanceData].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        for (let i = 0; i < sortedAttendance.length; i++) {
            const attendDate = new Date(sortedAttendance[i].date);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            if (attendDate.toDateString() === expectedDate.toDateString() && sortedAttendance[i].is_present) {
                streak++;
            } else {
                break;
            }
        }
        setCurrentStreak(streak);
    };

    const loading = enrollmentsLoading || attendanceLoading;

    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const activeCourses = enrollments.filter(e => e.status === 'approved').length;
    const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress_percentage, 0) / enrollments.length)
        : 0;

    if (loading && enrollments.length === 0 && attendance.length === 0) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="profile-section">
                            <div className="profile-avatar">
                                {user?.photo ? (
                                    <img src={user.photo} alt="Profile" />
                                ) : (
                                    <span className="avatar-initials">
                                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                    </span>
                                )}
                                <div className="status-indicator online"></div>
                            </div>
                            <div className="profile-info">
                                <h1>Welcome back, {user?.first_name}!</h1>
                                <p className="profile-email">{user?.email}</p>
                                {user?.bio && <p className="profile-bio">{user.bio}</p>}
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link to="/update-profile" className="btn btn-outline">
                                ✏️ Edit Profile
                            </Link>
                            <Link to="/assessments" className="btn btn-primary">
                                📝 Take Assessment
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Navigation */}
            <div className="dashboard-nav">
                <div className="container">
                    <div className="nav-tabs">
                        <button
                            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 Overview
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'courses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            📚 My Courses
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'performance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('performance')}
                        >
                            📈 Performance
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            👤 Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="container">
                    {activeTab === 'overview' && (
                        <div className="overview-content">
                            {/* Stats Grid */}
                            <div className="stats-grid">
                                <div className="stat-card primary">
                                    <div className="stat-icon">🔥</div>
                                    <div className="stat-details">
                                        <span className="stat-value">{currentStreak}</span>
                                        <span className="stat-label">Day Streak</span>
                                    </div>
                                </div>
                                <div className="stat-card success">
                                    <div className="stat-icon">📚</div>
                                    <div className="stat-details">
                                        <span className="stat-value">{activeCourses}</span>
                                        <span className="stat-label">Active Courses</span>
                                    </div>
                                </div>
                                <div className="stat-card info">
                                    <div className="stat-icon">🎓</div>
                                    <div className="stat-details">
                                        <span className="stat-value">{completedCourses}</span>
                                        <span className="stat-label">Completed</span>
                                    </div>
                                </div>
                                <div className="stat-card warning">
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-details">
                                        <span className="stat-value">{avgProgress}%</span>
                                        <span className="stat-label">Avg Progress</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <h2>Quick Actions</h2>
                                <div className="actions-grid">
                                    <Link to="/assessments" className="action-card">
                                        <div className="action-icon">📝</div>
                                        <h3>Daily Quiz</h3>
                                        <p>Complete today's quiz</p>
                                    </Link>
                                    <Link to="/certificates" className="action-card">
                                        <div className="action-icon">🏆</div>
                                        <h3>Certificates</h3>
                                        <p>View & download certificates</p>
                                    </Link>
                                    <Link to="/payments" className="action-card">
                                        <div className="action-icon">💳</div>
                                        <h3>Payments</h3>
                                        <p>View payment history</p>
                                    </Link>
                                    <Link to="/update-profile" className="action-card">
                                        <div className="action-icon">⚙️</div>
                                        <h3>Settings</h3>
                                        <p>Update your profile</p>
                                    </Link>
                                </div>
                            </div>

                            {/* Recent Courses */}
                            {enrollments.length > 0 && (
                                <div className="recent-courses">
                                    <h2>My Courses</h2>
                                    <div className="courses-list">
                                        {enrollments.slice(0, 3).map((enrollment) => (
                                            <div className="course-card" key={enrollment.id}>
                                                <div className="course-info">
                                                    <h4>{enrollment.course_name || 'Course'}</h4>
                                                    <span className={`status-badge ${enrollment.status}`}>
                                                        {enrollment.status}
                                                    </span>
                                                </div>
                                                <div className="course-progress">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${enrollment.progress_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-text">{enrollment.progress_percentage}%</span>
                                                </div>
                                                {enrollment.batch_name && (
                                                    <div className="course-batch">
                                                        🗓️ {enrollment.batch_name}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="courses-content">
                            <h2>My Enrolled Courses</h2>
                            {enrollments.length > 0 ? (
                                <div className="courses-grid">
                                    {enrollments.map((enrollment) => (
                                        <div className="course-detail-card" key={enrollment.id}>
                                            <div className="course-header">
                                                <h3>{enrollment.course_name || 'Course'}</h3>
                                                <span className={`status-badge ${enrollment.status}`}>
                                                    {enrollment.status}
                                                </span>
                                            </div>
                                            <div className="course-meta">
                                                {enrollment.batch_name && (
                                                    <p>📅 Batch: {enrollment.batch_name}</p>
                                                )}
                                                {enrollment.batch_time && (
                                                    <p>⏰ Time: {enrollment.batch_time}</p>
                                                )}
                                            </div>
                                            <div className="course-progress-section">
                                                <div className="progress-header">
                                                    <span>Progress</span>
                                                    <span>{enrollment.progress_percentage}%</span>
                                                </div>
                                                <div className="progress-bar large">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${enrollment.progress_percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="course-actions">
                                                {enrollment.status === 'completed' && (
                                                    <Link to="/certificates" className="btn btn-primary btn-sm">
                                                        🏆 View Certificate
                                                    </Link>
                                                )}
                                                <Link to="/assessments" className="btn btn-outline btn-sm">
                                                    📝 Take Assessment
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📚</div>
                                    <h3>No courses enrolled yet</h3>
                                    <p>Explore our courses and start your learning journey!</p>
                                    <Link to="/courses" className="btn btn-primary">
                                        Browse Courses
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="performance-content">
                            <h2>Your Performance</h2>
                            <div className="performance-overview">
                                <div className="perf-card">
                                    <h3>Attendance</h3>
                                    <div className="attendance-stats">
                                        <div className="stat-circle">
                                            <svg viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" className="bg-circle" />
                                                <circle
                                                    cx="50" cy="50" r="45"
                                                    className="progress-circle"
                                                    style={{
                                                        strokeDasharray: `${(attendance.filter(a => a.is_present).length / Math.max(attendance.length, 1)) * 283} 283`
                                                    }}
                                                />
                                            </svg>
                                            <span className="circle-text">
                                                {attendance.length > 0
                                                    ? Math.round((attendance.filter(a => a.is_present).length / attendance.length) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <p>Current Streak: <strong>{currentStreak} days</strong></p>
                                    </div>
                                </div>
                                <div className="perf-card">
                                    <h3>Course Completion</h3>
                                    <div className="completion-stats">
                                        <div className="stat-bar">
                                            <div className="bar-fill" style={{ width: `${avgProgress}%` }}></div>
                                        </div>
                                        <p>{completedCourses} of {enrollments.length} courses completed</p>
                                    </div>
                                </div>
                            </div>
                            <div className="performance-note">
                                <p>📊 Detailed performance analytics and assessment scores coming soon!</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="profile-content">
                            <div className="profile-card-large">
                                <div className="profile-cover"></div>
                                <div className="profile-body">
                                    <div className="profile-avatar-large">
                                        {user?.photo ? (
                                            <img src={user.photo} alt="Profile" />
                                        ) : (
                                            <span>{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="profile-details">
                                        <h2>{user?.first_name} {user?.last_name}</h2>
                                        <p className="email">{user?.email}</p>
                                        <p className="phone">{user?.phone || 'No phone added'}</p>
                                        {user?.bio && <p className="bio">{user.bio}</p>}
                                    </div>
                                    <div className="social-links-profile">
                                        {user?.linkedin_url && (
                                            <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                                LinkedIn
                                            </a>
                                        )}
                                        {user?.instagram_url && (
                                            <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                                Instagram
                                            </a>
                                        )}
                                        {user?.github_url && (
                                            <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                                GitHub
                                            </a>
                                        )}
                                    </div>
                                    <Link to="/update-profile" className="btn btn-primary">
                                        ✏️ Edit Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
