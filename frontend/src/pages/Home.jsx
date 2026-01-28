import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInstituteProfile, getFeaturedCourses } from '../services/api';
import CourseCard from '../components/CourseCard';
import './Home.css';

function Home() {
    const [institute, setInstitute] = useState(null);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            console.log("Home: Starting to fetch data...");
            try {
                const [instituteRes, coursesRes] = await Promise.all([
                    getInstituteProfile().catch(e => { console.error("Institute fetch failed", e); return { data: null }; }),
                    getFeaturedCourses().catch(e => { console.error("Courses fetch failed", e); return { data: [] }; })
                ]);
                console.log("Home: Fetch complete", { institute: !!instituteRes.data, courses: !!coursesRes.data });

                setInstitute(instituteRes.data);
                const coursesData = coursesRes.data?.results || coursesRes.data || [];
                setFeaturedCourses(Array.isArray(coursesData) ? coursesData : []);
            } catch (error) {
                console.error('Home: Unexpected error in fetchData:', error);
                setFeaturedCourses([]);
            } finally {
                console.log("Home: Setting loading to false");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-floating-shapes">
                    <div className="shape shape-1 animate-float"></div>
                    <div className="shape shape-2 animate-float"></div>
                    <div className="shape shape-3 animate-float"></div>
                </div>
                <div className="container">
                    <div className="hero-content fade-in">
                        <div className="hero-badge">
                            ISO 9001:2015 Certified
                        </div>
                        <h1 className="hero-title">
                            Welcome to <span className="text-gradient">CSC Computer Software College</span>
                        </h1>
                        <div className="hero-details">
                            <p className="hero-iso">Elampillai</p>
                        </div>
                        <div className="hero-buttons">
                            <Link to="/courses" className="btn btn-primary btn-lg">
                                Explore Courses
                            </Link>
                            <Link to="/contact" className="btn btn-secondary btn-lg">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card fade-in">
                            <div className="stat-icon">🎓</div>
                            <div className="stat-number">{institute?.years_of_experience}+</div>
                            <div className="stat-label">Years of Excellence</div>
                        </div>
                        <div className="stat-card fade-in">
                            <div className="stat-icon">👥</div>
                            <div className="stat-number">{(institute?.total_alumni / 100000).toFixed(0)}L+</div>
                            <div className="stat-label">Alumni Worldwide</div>
                        </div>
                        <div className="stat-card fade-in">
                            <div className="stat-icon">🏢</div>
                            <div className="stat-number">{institute?.total_centers}+</div>
                            <div className="stat-label">Centers Nationwide</div>
                        </div>
                        <div className="stat-card fade-in">
                            <div className="stat-icon">📚</div>
                            <div className="stat-number">{(institute?.students_per_year / 1000).toFixed(0)}K+</div>
                            <div className="stat-label">Students Annually</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section className="section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Featured Courses</h2>
                        <p>Explore our most popular and in-demand courses</p>
                    </div>
                    <div className="grid grid-3">
                        {featuredCourses.slice(0, 6).map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <Link to="/courses" className="btn btn-primary">
                            View All Courses
                        </Link>
                    </div>
                </div>
            </section>

            {/* Educational Partners Section */}
            {institute?.partners && institute.partners.length > 0 && (
                <section className="partners-section">
                    <div className="container">
                        <div className="section-header text-center">
                            <h2>Our Educational Partners</h2>
                            <p>Collaborating with industry leaders</p>
                        </div>
                        <div className="partners-grid">
                            {institute.partners.map((partner, index) => (
                                <div key={index} className="partner-card">
                                    <div className="partner-name">{partner}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Start Your Learning Journey?</h2>
                        <p>Join thousands of students who have transformed their careers with CSC</p>
                        <Link to="/courses" className="btn btn-primary btn-lg">
                            Enroll Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
