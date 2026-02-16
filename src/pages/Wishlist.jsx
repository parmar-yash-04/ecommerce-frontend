import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';

const Wishlist = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchWishlist();
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            if (isAuthenticated) {
                const response = await apiClient.get('/wishlist/');
                const items = response.data.items || response.data || [];
                setWishlistItems(Array.isArray(items) ? items : []);
            } else {
                const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
                setWishlistItems(guestWishlist);
            }
        } catch (error) {
            setMessage('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId, index) => {
        try {
            if (isAuthenticated) {
                await apiClient.delete(`/wishlist/remove/${itemId}`);
                setWishlistItems(prev => prev.filter(item => item.wishlist_item_id !== itemId));
            } else {
                const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
                guestWishlist.splice(index, 1);
                localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
                setWishlistItems(guestWishlist);
            }
            setMessage('Item removed from wishlist');
            setTimeout(() => setMessage(''), 2000);
        } catch (error) {
            setMessage('Failed to remove item');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    if (loading) {
        return <div className="loading">Loading wishlist...</div>;
    }

    return (
        <div className="wishlist-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <h1>My Wishlist</h1>
            </div>

            {message && <div className="message">{message}</div>}

            {wishlistItems.length === 0 ? (
                <div className="empty-state">
                    <p>Your wishlist is empty</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary">
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="wishlist-items">
                    {wishlistItems.map((item, index) => {
                        const product = isAuthenticated ? item.product : item;

                        if (!product) return null;

                        const productId = item.product_id || product.product_id || product.id || item.id;
                        const price = product.base_price;
                        const validPrice = typeof price === 'number' ? price : 0;

                        return (
                            <div key={isAuthenticated ? item.wishlist_item_id : index} className="wishlist-item">
                                <div className="item-info">
                                    <h3>{product.brand} {product.model_name}</h3>
                                    <p className="price">{formatPrice(validPrice)}</p>
                                </div>

                                <div className="item-actions">
                                    <button
                                        onClick={() => navigate(`/product/${productId}`)}
                                        className="btn btn-primary"
                                        disabled={!productId}
                                    >
                                        View Product
                                    </button>
                                    <button
                                        onClick={() => removeItem(isAuthenticated ? item.wishlist_item_id : null, index)}
                                        className="btn btn-danger"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
