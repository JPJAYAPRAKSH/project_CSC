import { Link } from 'react-router-dom';
import './CourseCard.css';

function CourseCard({ course }) {
    return (
        <Link to={`/courses/${course.id}`} className="course-card">
            <div className="course-card-header">
                <span className="course-badge">{course.category_name}</span>
                <span className="course-code">{course.code}</span>
            </div>

            <h3 className="course-title">{course.name}</h3>

            <p className="course-objective">{course.objective}</p>

            <div className="course-details">
                <div className="detail-item">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{course.duration}</span>
                </div>
                <div className="detail-item">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="course-fee">{course.formatted_fees}</span>
                </div>
            </div>

            <div className="course-card-footer">
                <span className="view-details">View Details →</span>
            </div>
        </Link>
    );
}

export default CourseCard;
