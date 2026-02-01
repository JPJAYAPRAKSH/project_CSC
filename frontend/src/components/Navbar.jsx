import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

import logo from '../assets/logo.png';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const toggleRef = useRef(null);
    const location = useLocation();
    const { user, isAuthenticated, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (menuRef.current && !menuRef.current.contains(event.target) && toggleRef.current && !toggleRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Base navigation links (always visible)
    const baseLinks = [
        { path: '/', label: 'Home' },
        { path: '/courses', label: 'Courses' },
        { path: '/about', label: 'About Us' },
        { path: '/gallery', label: 'Gallery' },
        { path: '/contact', label: 'Contact' },
    ];

    // Add Dashboard only if logged in
    const navLinks = isAuthenticated
        ? [...baseLinks.slice(0, 3), { path: '/dashboard', label: 'Dashboard' }, ...baseLinks.slice(3)]
        : baseLinks;

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container-wide navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="brand-logo">
                        <img src={logo} alt="CSC Logo" className="logo-img" />
                    </div>
                    <div className="brand-text">
                        <div className="brand-name">CSC Computer Education</div>
                        <div className="brand-tagline">Elampillai</div>
                    </div>
                </Link>

                <button
                    className="navbar-toggle"
                    ref={toggleRef}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="menu-icon"
                        width="32"
                        height="32"
                    >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} ref={menuRef}>
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

                    {/* Mobile Auth Items (Visible only on mobile) */}
                    <div className="mobile-auth-items mobile-only">
                        <button className="nav-link theme-toggle-mobile" onClick={toggleTheme}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        {isAuthenticated ? (
                            <button className="nav-link logout-mobile" onClick={handleLogout}>
                                🚪
                            </button>
                        ) : (
                            <Link to="/login" className="nav-link login-mobile" onClick={() => setIsMenuOpen(false)}>
                                🔐
                            </Link>
                        )}
                    </div>

                    {/* Desktop Auth Section (Hidden on mobile) */}
                    <div className="nav-auth desktop-only">
                        <div className="avatar-dropdown" ref={dropdownRef}>
                            <button
                                className="avatar-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="nav-avatar">
                                    {isAuthenticated && user?.photo ? (
                                        <img src={user.photo} alt={user?.first_name || 'User'} />
                                    ) : isAuthenticated ? (
                                        <span className="avatar-initials">
                                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                                        </span>
                                    ) : (
                                        <span className="avatar-initials">👤</span>
                                    )}
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="dropdown-header">
                                                <span className="user-name">{user?.first_name} {user?.last_name}</span>
                                                <span className="user-email">{user?.email}</span>
                                            </div>
                                            <Link to="/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                📊 Dashboard
                                            </Link>
                                            <Link to="/update-profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                ⚙️ Settings
                                            </Link>
                                            <button className="dropdown-item" onClick={toggleTheme}>
                                                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                                            </button>
                                            <div className="dropdown-divider"></div>
                                            <button className="dropdown-item logout" onClick={handleLogout}>
                                                🚪 Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                🔐 Login
                                            </Link>
                                            <Link to="/register" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                ✨ Register
                                            </Link>
                                            <div className="dropdown-divider"></div>
                                            <button className="dropdown-item" onClick={toggleTheme}>
                                                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
