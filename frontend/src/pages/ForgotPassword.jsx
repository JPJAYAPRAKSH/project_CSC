import { useState } from 'react';
import { requestOTP, verifyOTP, resetPassword } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await requestOTP({ email });
            setMessage('OTP sent to your email. Please check your inbox.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await verifyOTP({ email, code: otp });
            setMessage('OTP verified! Now enter your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await resetPassword({ email, code: otp, new_password: newPassword });
            alert('Password reset successful! You can now login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-icon">🔑</div>
                    <h1>{step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Set New Password'}</h1>
                    <p>
                        {step === 1 ? 'Enter your registered email to receive an OTP' :
                            step === 2 ? `Enter the 6-digit code sent to ${email}` :
                                'Choose a strong password for your account'}
                    </p>
                </div>

                <div className="auth-form">
                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {message && (
                        <div className="auth-success">
                            {message}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleRequestOTP}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="form-group">
                                <label>Enter 6-Digit OTP</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button type="button" className="admin-link" onClick={() => setStep(1)} style={{ marginTop: '1rem', width: '100%', cursor: 'pointer' }}>
                                🔄 Re-enter email
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="auth-footer">
                    <Link to="/login">Back to Student Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
