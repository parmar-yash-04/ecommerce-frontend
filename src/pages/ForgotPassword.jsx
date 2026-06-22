import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../config/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage('Please enter your email address');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            await apiClient.post('/auth/forgot-password', { email });
            setStep('reset');
            setMessage('If the email exists, an OTP has been sent. Please check your inbox.');
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setMessage('Please enter a valid 6-digit OTP');
            return;
        }
        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            await apiClient.post('/auth/reset-password', {
                email,
                otp,
                new_password: newPassword
            });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="brand">
                    <h1>Reset Password</h1>
                    <p className="subtitle">
                        {step === 'email'
                            ? 'Enter your email to receive an OTP'
                            : 'Enter the OTP and your new password'}
                    </p>
                </div>

                {message && (
                    <div className={`message ${message.includes('successful') ? 'success' : ''}`}>
                        {message}
                    </div>
                )}

                {step === 'email' && (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your registered email"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 'reset' && (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={email} disabled />
                        </div>
                        <div className="form-group">
                            <label>OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="At least 6 characters"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="auth-toggle">
                    <Link to="/login" className="link-btn">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
