import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAssessmentsForStudent, getSubmissionsByStudent } from '../services/api';
import './AssessmentPortal.css';

function AssessmentPortal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [assessmentsRes, submissionsRes] = await Promise.all([
                getAssessmentsForStudent(user.id),
                getSubmissionsByStudent(user.id)
            ]);
            setAssessments(assessmentsRes.data || []);
            setSubmissions(submissionsRes.data || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionForAssessment = (assessmentId) => {
        return submissions.find(s => s.assessment === assessmentId);
    };

    const getTypeLabel = (type) => {
        const labels = {
            quiz: 'Daily Quiz',
            test: 'Chapter Test',
            exam: 'Final Exam',
            practice: 'Practice'
        };
        return labels[type] || type;
    };

    const getTypeIcon = (type) => {
        const icons = {
            quiz: '📝',
            test: '📋',
            exam: '🎓',
            practice: '🔄'
        };
        return icons[type] || '📄';
    };

    const filteredAssessments = assessments.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'pending') {
            const sub = getSubmissionForAssessment(a.id);
            return !sub || sub.status === 'in_progress';
        }
        if (filter === 'completed') {
            const sub = getSubmissionForAssessment(a.id);
            return sub && (sub.status === 'submitted' || sub.status === 'graded');
        }
        return a.assessment_type === filter;
    });

    if (loading) {
        return (
            <div className="assessment-loading">
                <div className="spinner"></div>
                <p>Loading assessments...</p>
            </div>
        );
    }

    return (
        <div className="assessment-portal">
            <div className="portal-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-info">
                            <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                            <h1>Assessment Portal</h1>
                            <p>Complete quizzes and tests to track your progress</p>
                        </div>
                        <div className="header-stats">
                            <div className="stat">
                                <span className="stat-value">{assessments.length}</span>
                                <span className="stat-label">Available</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">
                                    {submissions.filter(s => s.status === 'graded').length}
                                </span>
                                <span className="stat-label">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="portal-content">
                <div className="container">
                    <div className="filter-bar">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`filter-btn ${filter === 'quiz' ? 'active' : ''}`}
                            onClick={() => setFilter('quiz')}
                        >
                            Quizzes
                        </button>
                        <button
                            className={`filter-btn ${filter === 'test' ? 'active' : ''}`}
                            onClick={() => setFilter('test')}
                        >
                            Tests
                        </button>
                    </div>

                    {filteredAssessments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📚</div>
                            <h3>No assessments found</h3>
                            <p>Check back later for new quizzes and tests!</p>
                        </div>
                    ) : (
                        <div className="assessments-grid">
                            {filteredAssessments.map(assessment => {
                                const submission = getSubmissionForAssessment(assessment.id);
                                const isCompleted = submission && (submission.status === 'submitted' || submission.status === 'graded');
                                const isInProgress = submission && submission.status === 'in_progress';

                                return (
                                    <div
                                        key={assessment.id}
                                        className={`assessment-card ${isCompleted ? 'completed' : ''}`}
                                    >
                                        <div className="card-header">
                                            <span className="type-badge">
                                                {getTypeIcon(assessment.assessment_type)} {getTypeLabel(assessment.assessment_type)}
                                            </span>
                                            {isCompleted && (
                                                <span className="status-badge success">✓ Completed</span>
                                            )}
                                            {isInProgress && (
                                                <span className="status-badge warning">⏳ In Progress</span>
                                            )}
                                        </div>
                                        <h3>{assessment.title}</h3>
                                        <p className="course-name">{assessment.course_name}</p>
                                        {assessment.description && (
                                            <p className="description">{assessment.description}</p>
                                        )}
                                        <div className="card-meta">
                                            <span>⏱️ {assessment.duration_minutes} mins</span>
                                            <span>📊 {assessment.total_marks} marks</span>
                                            <span>❓ {assessment.question_count} questions</span>
                                        </div>
                                        {isCompleted && submission ? (
                                            <div className="result-section">
                                                <div className="score-display">
                                                    <span className="score">{submission.score}/{assessment.total_marks}</span>
                                                    <span className={`percentage ${submission.percentage >= assessment.passing_marks ? 'pass' : 'fail'}`}>
                                                        {submission.percentage?.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-primary start-btn"
                                                onClick={() => navigate(`/assessments/${assessment.id}`)}
                                            >
                                                {isInProgress ? 'Continue' : 'Start Assessment'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AssessmentPortal;
