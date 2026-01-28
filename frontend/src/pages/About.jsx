import './About.css';

function About() {
    return (
        <div className="about-page">
            <div className="page-header">
                <div className="container">
                    <h1>About CSC Computer Software College</h1>
                    <p>ISO 9001:2015 Certified Institution</p>
                </div>
            </div>

            <div className="container section">
                <div className="about-content">
                    <div className="content-section">
                        <h2>Our Journey</h2>
                        <p>
                            Since 1986, CSC Computer Software College has been at the forefront of computer education in India.
                            For over 38 years, we have been empowering students with industry-relevant skills and knowledge,
                            helping them build successful careers in the ever-evolving technology sector.
                        </p>
                    </div>

                    <div className="stats-highlight">
                        <div className="stat-item">
                            <div className="stat-number">38+</div>
                            <div className="stat-label">Years of Excellence</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">50L+</div>
                            <div className="stat-label">Alumni Worldwide</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">360+</div>
                            <div className="stat-label">Centers Nationwide</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">1L+</div>
                            <div className="stat-label">Students Annually</div>
                        </div>
                    </div>

                    <div className="content-section">
                        <h2>Our Mission</h2>
                        <p>
                            To provide world-class computer education that empowers individuals with the skills and knowledge
                            needed to excel in the digital age. We are committed to delivering quality education that is
                            accessible, affordable, and aligned with industry requirements.
                        </p>
                    </div>

                    <div className="content-section">
                        <h2>Educational Partners</h2>
                        <div className="partners-list">
                            <div className="partner-item">Tally India Pvt Ltd</div>
                            <div className="partner-item">IBT Institute Pvt Ltd</div>
                            <div className="partner-item">Speak Easy English Training (P) Ltd</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
