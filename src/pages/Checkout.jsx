import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import generateInvoice from '../utils/generateInvoice';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Address
    const [cartItems, setCartItems] = useState([]);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCart();
        // Auto-fill email if user is logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setEmail(user.email || '');
        }
    }, []);

    const fetchCart = async () => {
        try {
            const response = await apiClient.get('/cart/');
            console.log('Cart response:', response.data);
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const handleSendOTP = async () => {
        if (!email) {
            setMessage('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            // POST /otp/send expects: { email }
            // Backend returns: { message, otp }
            const response = await apiClient.post('/otp/send', { email });
            const otpCode = response.data.otp;
            setMessage(`OTP sent to your email! Your OTP is: ${otpCode}`);
            setShowOtpPopup(true);
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setMessage('Please enter OTP');
            return;
        }

        // Validate OTP format - must be exactly 6 digits
        if (!/^\d{6}$/.test(otp)) {
            setMessage('OTP must be exactly 6 digits');
            return;
        }

        // Verify OTP with backend to ensure it's correct
        setLoading(true);
        try {
            await apiClient.post('/otp/verify', { email, otp });
            setShowOtpPopup(false);
            setStep(3);
            setMessage('OTP verified successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    const handlePlaceOrder = async () => {
        if (!address.street || !address.city || !address.state || !address.zipCode) {
            setMessage('Please fill in all address fields');
            return;
        }

        setLoading(true);
        try {
            // POST /checkout/place-order expects: { email, otp, shipping_address }
            // Backend returns: OrderResponse with order_id, order_number, etc.
            const response = await apiClient.post('/checkout/place-order', {
                email,
                otp,
                shipping_address: `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`
            });

            // Generate Invoice (Frontend)
            try {
                // Ensure we pass full items data even if backend response is minimal
                const orderData = {
                    ...response.data,
                    items: response.data.items || cartItems,
                    shipping_address: `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`,
                    created_at: new Date().toISOString()
                };
                generateInvoice(orderData);
                console.log('Invoice generated automatically');
            } catch (err) {
                console.error('Invoice generation failed:', err);
            }

            setMessage('Order placed successfully! Downloading invoice...');
            setTimeout(() => {
                navigate(`/order/${response.data.order_id}`);
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + ((item.price || 0) * (item.quantity || 1));
        }, 0).toFixed(2);
    };

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            {message && <div className={`message ${message.includes('Failed') || message.includes('failed') || message.includes('Error') || message.includes('error') || message.includes('Invalid') || message.includes('invalid') ? 'error' : 'success'}`}>{message}</div>}

            {/* OTP Popup */}
            {showOtpPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h2>Enter OTP</h2>
                        <p>We've sent an OTP to {email}</p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="form-input"
                        />
                        <div className="popup-buttons">
                            <button onClick={handleVerifyOTP} className="btn btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button onClick={() => setShowOtpPopup(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="checkout-container">
                {/* Step 1: Email */}
                {step >= 1 && (
                    <div className="checkout-section">
                        <h2>1. Email {step > 1 && '✓'}</h2>
                        {step === 1 ? (
                            <div className="form-group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="form-input"
                                />
                                <button onClick={handleSendOTP} className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                        ) : (
                            <p>{email}</p>
                        )}
                    </div>
                )}

                {/* Step 3: Address */}
                {step >= 3 && (
                    <div className="checkout-section">
                        <h2>2. Shipping Address</h2>
                        <div className="address-form">
                            <div className="form-group">
                                <label>Street Address:</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={address.street}
                                    onChange={handleAddressChange}
                                    placeholder="Street address"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City:</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleAddressChange}
                                        placeholder="City"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>State:</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={address.state}
                                        onChange={handleAddressChange}
                                        placeholder="State"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Zip Code:</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={address.zipCode}
                                        onChange={handleAddressChange}
                                        placeholder="Zip Code"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Country:</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={address.country}
                                        onChange={handleAddressChange}
                                        placeholder="Country"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Summary */}
                <div className="checkout-section">
                    <h2>Order Summary</h2>
                    <div className="order-items">
                        {cartItems.map((item) => (
                            <div key={item.cart_item_id} className="order-item">
                                <span>Product Variant x {item.quantity}</span>
                                <span>₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="order-total">
                        <span>Total</span>
                        <span>₹{calculateTotal()}</span>
                    </div>

                    {step === 3 && (
                        <button onClick={handlePlaceOrder} className="btn btn-primary btn-large" disabled={loading}>
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
