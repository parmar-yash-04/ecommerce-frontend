import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                if (isAuthenticated) {
                    const [cartRes, wishlistRes] = await Promise.all([
                        apiClient.get('/cart/'),
                        apiClient.get('/wishlist/')
                    ]);
                    setCartCount(cartRes.data.items?.length || 0);
                    setWishlistCount(wishlistRes.data.items?.length || 0);
                } else {
                    const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                    const wishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
                    setCartCount(cart.length);
                    setWishlistCount(wishlist.length);
                }
            } catch (error) {
                console.error('Error fetching counts:', error);
                const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const wishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
                setCartCount(cart.length);
                setWishlistCount(wishlist.length);
            }
        };

        fetchCounts();

        const interval = setInterval(fetchCounts, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    📱 PhoneShop
                </Link>

                <div className="navbar-right">
                    <Link to="/cart" className="navbar-icon">
                        🛒 Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </Link>

                    <Link to="/wishlist" className="navbar-icon">
                        ❤️ Wishlist {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/orders" className="navbar-link">My Orders</Link>
                            <span className="navbar-user">Hi, {user?.username || user?.email}</span>
                            <button onClick={logout} className="navbar-btn">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="navbar-btn">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
