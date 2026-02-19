import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import apiClient from '../config/api';
import './Home.css';

const Home = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceSort, setPriceSort] = useState('default');
    
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.brand?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
        if (priceSort === 'low') {
            filtered.sort((a, b) => a.base_price - b.base_price);
        } else if (priceSort === 'high') {
            filtered.sort((a, b) => b.base_price - a.base_price);
        }
        return filtered;
    }, [allProducts, selectedCategory, priceSort]);

    const totalPages = Math.ceil(filteredProducts.length / pageSize);

    const categories = ['all', 'Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google', 'OPPO', 'Vivo', 'Realme', 'Motorola'];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/products/', {
                params: { page: 1, size: 50 }
            });
            setAllProducts(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch products from backend:', err);
            setAllProducts([]);
            setError('Failed to load products. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(1);
        }
    }, [filteredProducts.length]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setPriceSort('default');
        setPage(1);
    };

    const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
    const total = filteredProducts.length;
    const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
    const endItem = Math.min(page * pageSize, total);

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
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setPage(1);
                                }}
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
                                onChange={(e) => {
                                    setPriceSort(e.target.value);
                                    setPage(1);
                                }}
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
                            Showing <strong>{startItem}-{endItem}</strong> of <strong>{filteredProducts.length}</strong> products
                        </span>
                    </div>

                    <div className="products-grid">
                        {paginatedProducts.map((product) => (
                            <div key={product.product_id} className="product-card">
                                <div className="product-image">
                                    <LazyLoadImage
                                        src={product.image_url || 'https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=400&q=80'}
                                        alt={product.model_name}
                                        effect="blur"
                                        onError={(e) => {
                                            e.target.src = 'https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=400&q=80';
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

                    {(allProducts.length === 0 || filteredProducts.length === 0) && (
                        <div className="empty-state">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters to find what you're looking for.</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                className="pagination-btn"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            
                            <button 
                                className="pagination-btn"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Home;
