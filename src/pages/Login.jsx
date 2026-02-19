import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [loginMethod, setLoginMethod] = useState('password');
    const [otpStep, setOtpStep] = useState('send');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        phone_number: ''
    });
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect') || '/';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const loginData = new URLSearchParams();
            loginData.append('username', formData.email);
            loginData.append('password', formData.password);

            const response = await apiClient.post('/auth/login', loginData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, token_type } = response.data;

            const userData = {
                email: formData.email,
                username: formData.email.split('@')[0]
            };

            login(access_token, userData);

            await mergeGuestData(access_token);

            setMessage('Login successful!');

            setTimeout(() => {
                if (redirect && redirect !== '/') {
                    const redirectPath = redirect.startsWith('/') ? redirect : `/${redirect}`;
                    console.log('Redirecting to:', redirectPath);
                    navigate(redirectPath);
                } else {
                    console.log('Redirecting to home');
                    navigate('/');
                }
            }, 500);
        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            let errorMessage = 'Login failed. Please check your credentials.';

            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map(err => {
                    const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
                    const msg = err.msg || 'is required';
                    return `${field}: ${msg}`;
                }).join(', ');
            } else if (typeof errorDetail === 'object') {
                errorMessage = JSON.stringify(errorDetail);
            }

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await apiClient.post('/users/create', {
                username: formData.username || formData.email.split('@')[0],
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password
            });

            setMessage('Account created successfully! Please login.');
            setIsLogin(true);
            setFormData({ email: formData.email, password: '', username: '', phone_number: '' });
        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            let errorMessage = 'Signup failed. Please try again.';

            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map(err => {
                    const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
                    const msg = err.msg || 'is required';
                    return `${field}: ${msg}`;
                }).join(', ');
            } else if (typeof errorDetail === 'object') {
                errorMessage = JSON.stringify(errorDetail);
            }

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const mergeGuestData = async (token) => {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        for (const item of guestCart) {
            try {
                await apiClient.post('/cart/add', {
                    variant_id: item.variant_id,
                    quantity: item.quantity
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error merging cart item:', error);
            }
        }
        localStorage.removeItem('guestCart');

        const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        for (const item of guestWishlist) {
            try {
                await apiClient.post('/wishlist/add', {
                    product_id: item.product_id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error merging wishlist item:', error);
            }
        }
        localStorage.removeItem('guestWishlist');
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
            const response = await fetch(`${API_BASE_URL}/auth/google`);
            const data = await response.json();
            window.location.href = data.authorization_url || data.url;
        } catch (error) {
            console.error('Google login error:', error);
            setMessage('Failed to initiate Google login');
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!formData.email) {
            setMessage('Please enter your email address');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            await apiClient.post('/otp/send', { email: formData.email });
            setOtpStep('verify');
            setMessage('OTP sent to your email! Please check your inbox.');
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setMessage('Please enter a valid 6-digit OTP');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            await apiClient.post('/otp/verify', { email: formData.email, otp });
            
            const userData = {
                email: formData.email,
                username: formData.email.split('@')[0]
            };
            
            const loginData = new URLSearchParams();
            loginData.append('username', formData.email);
            loginData.append('password', 'otp_login');
            
            try {
                const response = await apiClient.post('/auth/login', loginData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                const { access_token } = response.data;
                login(access_token, userData);
                await mergeGuestData(access_token);
                setMessage('Login successful!');
                setTimeout(() => {
                    navigate(redirect || '/');
                }, 500);
            } catch (loginError) {
                login('otp_verified', userData);
                localStorage.setItem('otp_verified_email', formData.email);
                setMessage('OTP verified! Complete your profile on first login.');
                setTimeout(() => {
                    navigate(redirect || '/');
                }, 500);
            }
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const switchToPasswordLogin = () => {
        setLoginMethod('password');
        setOtpStep('send');
        setOtp('');
        setMessage('');
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');
        const error = params.get('error');
        
        if (error) {
            setMessage('Google login failed. Please try again.');
            window.history.replaceState({}, document.title, '/login');
            return;
        }

        if (token) {
            const userDataParam = params.get('user_data');
            let userData = { email: 'Google User', username: 'Google User', user_id: null };
            
            if (userDataParam) {
                try {
                    userData = JSON.parse(decodeURIComponent(userDataParam));
                } catch (e) {
                    console.error('Failed to parse user data:', e);
                }
            }
            
            login(token, userData);
            mergeGuestData(token).then(() => {
                setMessage('Google login successful!');
                setTimeout(() => {
                    navigate(redirect || '/');
                }, 500);
            });
            
            window.history.replaceState({}, document.title, '/login');
        }
    }, [navigate, redirect, login]);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="brand">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
                        </svg>
                    </div>
                    <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="subtitle">{isLogin ? 'Sign in to continue shopping' : 'Sign up to get started'}</p>
                </div>

                {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}

                {isLogin && (
                    <button 
                        onClick={handleGoogleLogin} 
                        className="btn btn-google"
                        disabled={loading}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {loading ? 'Loading...' : 'Continue with Google'}
                    </button>
                )}

                {isLogin && <div className="auth-divider"><span>or sign in with email</span></div>}

                {isLogin && (
                    <>
                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your password"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Please wait...' : 'Sign In'}
                            </button>
                        </form>
                    </>
                )}

                {!isLogin && (
                    <form onSubmit={handleSignup} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Please wait...' : 'Create Account'}
                        </button>
                    </form>
                )}

                <p className="auth-toggle">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} className="link-btn">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
