import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../config/api';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceSort, setPriceSort] = useState('default');

    const categories = ['all', 'Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google', 'OPPO', 'Vivo', 'Realme', 'Motorola'];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/products/');
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch products from backend:', err);
            setProducts([]);
            setError('Failed to load products. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products
        .filter(product => {
            if (selectedCategory === 'all') return true;
            return product.brand?.toLowerCase() === selectedCategory.toLowerCase();
        })
        .sort((a, b) => {
            if (priceSort === 'low') return a.base_price - b.base_price;
            if (priceSort === 'high') return b.base_price - a.base_price;
            return 0;
        });

    const clearFilters = () => {
        setSelectedCategory('all');
        setPriceSort('default');
    };

    if (loading) {
        return (
            <div className="home-page">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="page-header">
                <h1 className="page-title">All Phones</h1>
                <p className="page-subtitle">Find your perfect smartphone</p>
            </div>

            <div className="home-container">
                <aside className="sidebar">
                    <div className="filter-panel">
                        <h3>Filters</h3>
                        
                        <div className="filter-section">
                            <label>Category</label>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Brands' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-section">
                            <label>Sort by Price</label>
                            <select 
                                value={priceSort} 
                                onChange={(e) => setPriceSort(e.target.value)}
                            >
                                <option value="default">Default</option>
                                <option value="low">Price: Low to High</option>
                                <option value="high">Price: High to Low</option>
                            </select>
                        </div>

                        {(selectedCategory !== 'all' || priceSort !== 'default') && (
                            <button className="clear-filters-btn" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </aside>

                <main className="main-content">
                    {error && (
                        <div className="error-notice">
                            <p>⚠️ {error}</p>
                        </div>
                    )}

                    <div className="results-header">
                        <span className="results-count">
                            Showing <strong>{filteredProducts.length}</strong> products
                        </span>
                    </div>

                    <div className="products-grid">
                        {filteredProducts.map((product) => (
                            <div key={product.product_id} className="product-card">
                                <div className="product-image">
                                    <img
                                        src={product.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80'}
                                        alt={product.model_name}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80';
                                        }}
                                    />
                                </div>

                                <div className="product-info">
                                    <p className="product-brand">{product.brand}</p>
                                    <h3 className="product-name">{product.model_name}</h3>
                                    <p className="product-description">{product.description}</p>
                                    <div className="product-price-row">
                                        <span className="product-price">₹{product.base_price.toLocaleString()}</span>
                                    </div>

                                    <Link to={`/product/${product.product_id}`} className="add-to-cart-btn">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="empty-state">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters to find what you're looking for.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Home;
