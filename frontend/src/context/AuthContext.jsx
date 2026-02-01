import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = '/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_BASE}/auth/me/`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.is_authenticated) {
                setUser(data.student);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await fetch(`${API_BASE}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        setUser(data.student);
        // Store in localStorage for persistence
        localStorage.setItem('student', JSON.stringify(data.student));
        return data;
    };

    const register = async (userData) => {
        const response = await fetch(`${API_BASE}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            const textData = await response.text();
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }

        if (!response.ok) {
            throw new Error(data?.error || 'Registration failed');
        }

        setUser(data.student);
        localStorage.setItem('student', JSON.stringify(data.student));
        return data;
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout/`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        localStorage.removeItem('student');
    };

    // Restore from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('student');
            if (stored && !user) {
                setUser(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to parse stored student data:', error);
            localStorage.removeItem('student');
        }
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        isStudent: !!user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
