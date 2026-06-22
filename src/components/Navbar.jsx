import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';
import './SearchBar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [autocompleteSuggestion, setAutocompleteSuggestion] = useState('');
    const searchRef = useRef(null);
    const debounceRef = useRef(null);
    const inputRef = useRef(null);

    const findAutocompleteMatch = (query, suggestions) => {
        const q = query.trim().toLowerCase();
        if (!q) return '';
        for (const s of suggestions) {
            if (s.text.toLowerCase().startsWith(q)) return s.text;
        }
        return '';
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (autocompleteSuggestion && !autocompleteSuggestion.toLowerCase().startsWith(value.trim().toLowerCase())) {
            setAutocompleteSuggestion('');
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setSuggestions([]);
            setAutocompleteSuggestion('');
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const [searchRes, suggestRes] = await Promise.all([
                    apiClient.get('/products/search', {
                        params: { q: value.trim(), page: 1, size: 5 }
                    }),
                    apiClient.get('/products/suggestions', {
                        params: { q: value.trim(), limit: 5 }
                    })
                ]);
                const fetchedSuggestions = suggestRes.data.suggestions || [];
                setSearchResults(searchRes.data.data || []);
                setSuggestions(fetchedSuggestions);
                setAutocompleteSuggestion(findAutocompleteMatch(value, fetchedSuggestions));
                setShowDropdown(true);
            } catch (err) {
                console.error('Search error:', err);
                setSearchResults([]);
                setSuggestions([]);
                setAutocompleteSuggestion('');
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && autocompleteSuggestion) {
            e.preventDefault();
            setSearchQuery(autocompleteSuggestion);
            setAutocompleteSuggestion('');
            inputRef.current?.focus();
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setShowDropdown(false);
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleResultClick = (productId) => {
        setShowDropdown(false);
        setSearchQuery('');
        setSearchResults([]);
        setSuggestions([]);
        setAutocompleteSuggestion('');
        navigate(`/product/${productId}`);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.text);
        setShowDropdown(false);
        setSearchResults([]);
        setSuggestions([]);
        setAutocompleteSuggestion('');
        navigate(`/?search=${encodeURIComponent(suggestion.text)}`);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSuggestions([]);
        setAutocompleteSuggestion('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

                {/* Search Bar */}
                <div className="search-bar-container" ref={searchRef}>
                    <form className="search-bar" onSubmit={handleSearchSubmit}>
                        <span className="search-icon">🔍</span>
                        <div className="input-wrapper">
                            {autocompleteSuggestion && (
                                <span className="autocomplete-ghost">{autocompleteSuggestion}</span>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => { if (suggestions.length > 0 || searchResults.length > 0) setShowDropdown(true); }}
                            />
                        </div>
                        {searchQuery && (
                            <button type="button" className="search-clear" onClick={clearSearch}>✕</button>
                        )}
                    </form>

                    {showDropdown && (
                        <div className="search-dropdown">
                            {searchLoading ? (
                                <div className="search-loading">Searching...</div>
                            ) : (
                                <>
                                    {suggestions.length > 0 && (
                                        <div className="search-suggestions-section">
                                            <div className="search-dropdown-header">Suggestions</div>
                                            {suggestions.map((s, i) => (
                                                <div
                                                    key={`s-${i}`}
                                                    className="search-suggestion-item"
                                                    onClick={() => handleSuggestionClick(s)}
                                                >
                                                    <span className="suggestion-icon">💡</span>
                                                    <span className="suggestion-text">{s.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.length > 0 && (
                                        <>
                                            <div className="search-dropdown-header">Products</div>
                                            {searchResults.map(product => (
                                                <div
                                                    key={product.variant_id || product.product_id}
                                                    className="search-result-item"
                                                    onClick={() => handleResultClick(product.product_id)}
                                                >
                                                    <img
                                                        src={product.image_url || 'https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=100&q=80'}
                                                        alt={product.model_name}
                                                        onError={(e) => {
                                                            e.target.src = 'https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=100&q=80';
                                                        }}
                                                    />
                                                    <div className="search-result-info">
                                                        <div className="result-brand">{product.brand}</div>
                                                        <div className="result-name">{product.model_name}</div>
                                                    </div>
                                                    <span className="search-result-price">₹{product.price?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="search-dropdown-footer">
                                                <a href={`/?search=${encodeURIComponent(searchQuery)}`}
                                                    onClick={(e) => { e.preventDefault(); handleSearchSubmit(e); }}>
                                                    View all results →
                                                </a>
                                            </div>
                                        </>
                                    )}

                                    {suggestions.length === 0 && searchResults.length === 0 && (
                                        <div className="search-dropdown-empty">No results found</div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

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
