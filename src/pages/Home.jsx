import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../config/api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

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

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="home-page">
            <h1 className="page-title">All Phones</h1>

            {error && (
                <div className="error-notice">
                    <p>⚠️ {error}</p>
                </div>
            )}

            <div className="products-grid">
                {products.map((product) => (
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
                            <h3 className="product-name">{product.brand} {product.model_name}</h3>
                            <p className="product-description">{product.description}</p>
                            <p className="product-price">₹{product.base_price}</p>

                            <Link to={`/product/${product.product_id}`} className="btn btn-primary">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="empty-state">
                    <p>No products available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default Home;
