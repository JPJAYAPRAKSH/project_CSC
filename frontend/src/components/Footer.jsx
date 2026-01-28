import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>CSC Computer Software College</h4>
                        <p>Elampillai</p>
                        <p>Empowering Careers Through Quality Education Since 1986</p>
                        <div className="footer-stats">
                            <div className="stat">
                                <strong>38+</strong>
                                <span>Years</span>
                            </div>
                            <div className="stat">
                                <strong>50L+</strong>
                                <span>Alumni</span>
                            </div>
                            <div className="stat">
                                <strong>360+</strong>
                                <span>Centers</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/courses">Courses</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/student-portal">Student Portal</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Course Categories</h4>
                        <ul>
                            <li><Link to="/courses?category=diploma">Diploma Courses</Link></li>
                            <li><Link to="/courses?category=advanced-diploma">Advanced Diploma</Link></li>
                            <li><Link to="/courses?category=honours-diploma">Honours Diploma</Link></li>
                            <li><Link to="/courses?category=short-term">Short-Term Courses</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Contact Info</h4>
                        <p>Email: info@csccomputers.com</p>
                        <p>Phone: +91-XXXXXXXXXX</p>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook">FB</a>
                            <a href="#" aria-label="Twitter">TW</a>
                            <a href="#" aria-label="LinkedIn">LI</a>
                            <a href="#" aria-label="Instagram">IG</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} CSC Computer Software College. All rights reserved.</p>
                    <p>Educational Partners: Tally India Pvt Ltd | IBT Institute Pvt Ltd | Speak Easy English Training (P) Ltd</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
