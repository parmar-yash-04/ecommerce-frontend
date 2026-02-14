import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        phone_number: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Get redirect path from query params
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
            // Backend uses OAuth2PasswordRequestForm which expects 'username' and 'password' fields
            // Even though we're using email, OAuth2 standard requires the field name to be 'username'
            const loginData = new URLSearchParams();
            loginData.append('username', formData.email); // OAuth2 uses 'username' field for email
            loginData.append('password', formData.password);

            const response = await apiClient.post('/auth/login', loginData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, token_type } = response.data;

            // Store user data (email) since /users/me endpoint may not exist
            const userData = {
                email: formData.email,
                username: formData.email.split('@')[0]
            };

            login(access_token, userData);

            // Merge guest cart and wishlist with user's account
            await mergeGuestData(access_token);

            setMessage('Login successful!');

            // Redirect after a short delay
            setTimeout(() => {
                // Fix redirect path handling
                if (redirect && redirect !== '/') {
                    // If redirect doesn't start with '/', add it
                    const redirectPath = redirect.startsWith('/') ? redirect : `/${redirect}`;
                    console.log('Redirecting to:', redirectPath);
                    navigate(redirectPath);
                } else {
                    // Default to home page
                    console.log('Redirecting to home');
                    navigate('/');
                }
            }, 500);
        } catch (error) {
            // Handle validation errors from FastAPI/Pydantic
            const errorDetail = error.response?.data?.detail;
            let errorMessage = 'Login failed. Please check your credentials.';

            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            } else if (Array.isArray(errorDetail)) {
                // Pydantic validation errors are arrays of objects with {loc, msg, type}
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
            // Backend expects: { username, email, phone_number, password }
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
            // Handle validation errors from FastAPI/Pydantic
            const errorDetail = error.response?.data?.detail;
            let errorMessage = 'Signup failed. Please try again.';

            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            } else if (Array.isArray(errorDetail)) {
                // Pydantic validation errors are arrays of objects with {loc, msg, type}
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
        // Merge guest cart
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

        // Merge guest wishlist
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

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

                {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}

                <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username (optional)"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number:</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <p className="auth-toggle">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button onClick={() => setIsLogin(!isLogin)} className="link-btn">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
