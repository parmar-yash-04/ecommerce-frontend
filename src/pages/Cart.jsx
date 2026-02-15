import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';
import './Cart.css';

const Cart = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            if (isAuthenticated) {
                const response = await apiClient.get('/cart/');
                console.log('Cart API Response:', response.data);
                console.log('Cart Items:', response.data.items);
                console.log('First item image_url:', response.data.items?.[0]?.image_url);
                setCartItems(response.data.items || []);
            } else {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                setCartItems(guestCart);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setMessage('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        try {
            if (newQuantity < 1) return;

            if (isAuthenticated) {
                await apiClient.put('/cart/update', {
                    cart_item_id: cartItemId,
                    quantity: newQuantity
                });
                // Optimistic update or refetch
                fetchCart();
            } else {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const index = guestCart.findIndex((_, idx) => idx === cartItemId);
                if (index !== -1) {
                    guestCart[index].quantity = newQuantity;
                    localStorage.setItem('guestCart', JSON.stringify(guestCart));
                    fetchCart();
                }
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            setMessage('Failed to update cart');
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            if (isAuthenticated) {
                await apiClient.delete(`/cart/remove/${cartItemId}`);
                fetchCart();
            } else {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                guestCart.splice(cartItemId, 1);
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                fetchCart();
            }
        } catch (error) {
            console.error('Error removing item:', error);
            setMessage('Failed to remove item');
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.price || item.variant?.price || item.base_price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const shipping = 0; // Free shipping
    // Tax removed as per requirement
    const totalAmount = subtotal + shipping;

    const proceedToCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    if (loading) return <div className="loading">Loading your cart...</div>;

    return (
        <div className="cart-page-custom">
            <header className="cart-header">
                <h1 className="cart-title">Shopping Cart</h1>
                <span className="cart-count-badge">{cartItems.length} Items</span>
            </header>

            {message && <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>{message}</div>}

            <div className="cart-grid">
                {/* Left Column */}
                <div className="cart-left-column">
                    {cartItems.length === 0 ? (
                        <div className="empty-state">
                            <p>Your cart is empty</p>
                            <button onClick={() => navigate('/')} className="btn btn-primary">
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items-section">
                            {cartItems.map((item, index) => {
                                const finalPrice = item.price || item.variant?.price || 0;
                                const itemId = isAuthenticated ? item.cart_item_id : index;
                                const itemUniqueKey = isAuthenticated ? item.cart_item_id : `guest-${index}`;

                                return (
                                    <div key={itemUniqueKey} className="cart-item-card">
                                        <div className="item-image-container">
                                            <img
                                                src={item.image_url || item.variant?.image_url || item.product?.image_url || "https://placehold.co/150x150?text=Product"}
                                                alt={item.model_name || "Product"}
                                                className="item-image"
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/150x150?text=Product';
                                                }}
                                            />
                                        </div>
                                        <div className="item-details">
                                            <div className="item-header">
                                                <div>
                                                    <h3 className="item-name">
                                                        {item.brand} {item.model_name}
                                                    </h3>
                                                    <div className="item-variant">
                                                        {item.color}
                                                        {item.ram && item.storage ? ` | ${item.ram}/${item.storage}` : ''}
                                                    </div>
                                                </div>
                                                <div className="item-price">
                                                    ₹{finalPrice.toLocaleString('en-IN')}
                                                </div>
                                            </div>

                                            <div className="item-controls">
                                                <div className="quantity-control">
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => updateQuantity(itemId, (item.quantity || 1) - 1)}
                                                        disabled={(item.quantity || 1) <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={item.quantity || 1}
                                                        className="qty-input"
                                                    />
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => updateQuantity(itemId, (item.quantity || 1) + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div className="item-actions">
                                                    <button className="action-btn save-later">
                                                        <span>♡</span> Save for later
                                                    </button>
                                                    <button
                                                        className="action-btn remove"
                                                        onClick={() => removeItem(itemId)}
                                                    >
                                                        <span>🗑</span> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column: Summary */}
                <div className="cart-sidebar">
                    <div className="order-summary-card">
                        <h2 className="summary-title">Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span style={{ color: '#2ecc71' }}>Free</span>
                        </div>
                        {/* Tax row removed */}

                        <div className="summary-row total">
                            <span>Total Amount</span>
                            <span className="total-amount">
                                ₹{totalAmount.toLocaleString('en-IN')}
                                <span className="tax-note">Inclusive of all taxes</span>
                            </span>
                        </div>

                        <button onClick={proceedToCheckout} className="btn-checkout">
                            Proceed to Checkout <span>→</span>
                        </button>

                        <div className="secure-checkout">
                            <span>🛡</span> Secure Checkout
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
