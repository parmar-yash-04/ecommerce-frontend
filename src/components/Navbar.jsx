import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

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

    // Close menu on route change / link click
    const closeMenu = () => setMenuOpen(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    📱 NexCart
                </Link>

                <button
                    className={`hamburger ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Overlay for mobile */}
                {menuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}

                <div className={`navbar-right ${menuOpen ? 'open' : ''}`}>
                    <Link to="/cart" className="navbar-icon" onClick={closeMenu}>
                        🛒 Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </Link>

                    <Link to="/wishlist" className="navbar-icon" onClick={closeMenu}>
                        ❤️ Wishlist {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/orders" className="navbar-link" onClick={closeMenu}>My Orders</Link>
                            <span className="navbar-user">Hi, {user?.username || user?.email}</span>
                            <button onClick={() => { logout(); closeMenu(); }} className="navbar-btn">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="navbar-btn" onClick={closeMenu}>Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
