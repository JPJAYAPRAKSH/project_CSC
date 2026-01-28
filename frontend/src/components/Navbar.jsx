import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

import logo from '../assets/logo.png';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout, loading } = useAuth();

    console.log("Navbar: Authentication state", { isAuthenticated, loading, user: user?.first_name });

    // Base navigation links (always visible)
    const baseLinks = [
        { path: '/', label: 'Home' },
        { path: '/courses', label: 'Courses' },
        { path: '/about', label: 'About Us' },
        { path: '/gallery', label: 'Gallery' },
        { path: '/contact', label: 'Contact' },
    ];

    // Add Student Portal only if logged in
    const navLinks = isAuthenticated
        ? [...baseLinks.slice(0, 3), { path: '/student-portal', label: 'Student Portal' }, ...baseLinks.slice(3)]
        : baseLinks;

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container-wide navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="brand-logo">
                        <img src={logo} alt="CSC Logo" className="logo-img" />
                    </div>
                    <div className="brand-text">
                        <div className="brand-name">CSC Computer Software College</div>
                        <div className="brand-tagline">Elampillai</div>
                    </div>
                </Link>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Auth Section */}
                    <div className="nav-auth">
                        {isAuthenticated ? (
                            <>
                                <span className="nav-user">
                                    👤 {user?.first_name}
                                </span>
                                <button
                                    className="nav-logout"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="nav-login-btn"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
