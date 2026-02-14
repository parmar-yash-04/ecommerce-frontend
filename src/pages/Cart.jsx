import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';

const Cart = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartData, setCartData] = useState(null); // Will hold { cart_id, items: [...] }
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
                // Backend returns: { cart_id, items: [{ cart_item_id, variant_id, quantity }] }
                const response = await apiClient.get('/cart/');
                console.log('Cart response from backend:', response.data);
                console.log('Cart items:', response.data.items);
                setCartData(response.data);
                setCartItems(response.data.items || []);
            } else {
                // Guest cart stored locally with full product info
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
            if (isAuthenticated) {
                // Backend expects: { cart_item_id, quantity }
                await apiClient.put('/cart/update', {
                    cart_item_id: cartItemId,
                    quantity: newQuantity
                });
                fetchCart();
            } else {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const index = guestCart.findIndex((item, idx) => idx === cartItemId);
                if (index !== -1) {
                    guestCart[index].quantity = newQuantity;
                    localStorage.setItem('guestCart', JSON.stringify(guestCart));
                    fetchCart();
                }
            }
            setMessage('Cart updated!');
            setTimeout(() => setMessage(''), 2000);
        } catch (error) {
            console.error('Error updating cart:', error);
            setMessage('Failed to update cart');
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            if (isAuthenticated) {
                // DELETE /cart/remove/{cart_item_id}
                await apiClient.delete(`/cart/remove/${cartItemId}`);
                fetchCart();
            } else {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                guestCart.splice(cartItemId, 1);
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                fetchCart();
            }
            setMessage('Item removed from cart');
            setTimeout(() => setMessage(''), 2000);
        } catch (error) {
            console.error('Error removing item:', error);
            setMessage('Failed to remove item');
        }
    };

    const proceedToCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    const calculateTotal = () => {
        const total = cartItems.reduce((total, item) => {
            // Backend might return price in different fields
            const price = item.price || item.variant?.price || item.base_price || 0;
            const quantity = item.quantity || 1;
            console.log(`Item: ${item.model_name}, Price: ${price}, Qty: ${quantity}`);
            return total + (price * quantity);
        }, 0);
        return total.toFixed(2);
    };

    if (loading) {
        return <div className="loading">Loading cart...</div>;
    }

    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>

            {message && <div className="message">{message}</div>}

            {cartItems.length === 0 ? (
                <div className="empty-state">
                    <p>Your cart is empty</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary">
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map((item, index) => (
                            <div key={isAuthenticated ? item.cart_item_id : index} className="cart-item">
                                <div className="item-info">
                                    <h3>
                                        {item.brand && item.model_name ? `${item.brand} ${item.model_name}` : 'Product'}
                                    </h3>
                                    {item.color && <p>Color: {item.color}</p>}
                                    {item.ram && item.storage && <p>Variant: {item.ram}/{item.storage}</p>}
                                    <p className="price">₹{item.price || item.variant?.price || 0}</p>
                                </div>

                                <div className="item-actions">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(
                                            isAuthenticated ? item.cart_item_id : index,
                                            parseInt(e.target.value) || 1
                                        )}
                                        className="quantity-input"
                                    />
                                    <button
                                        onClick={() => removeItem(isAuthenticated ? item.cart_item_id : index)}
                                        className="btn btn-danger"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Total: ₹{calculateTotal()}</h2>
                        <button onClick={proceedToCheckout} className="btn btn-primary btn-large">
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
