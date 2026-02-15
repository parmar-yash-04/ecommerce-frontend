import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const { isAuthenticated } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            // Backend endpoint /products/{id}/variants returns ProductWithVariants
            // which contains both product details AND variants in one response
            const response = await apiClient.get(`/products/${id}/variants`);

            console.log('Backend ProductWithVariants response:', response.data);

            // Extract product and variants from the response
            setProduct(response.data);  // The product is the main object
            setVariants(response.data.variants || []);  // Variants are nested

            if (response.data.variants && response.data.variants.length > 0) {
                console.log('Setting selected variant to:', response.data.variants[0]);
                setSelectedVariant(response.data.variants[0]);
                setSelectedColor(response.data.variants[0].color);
            } else {
                console.warn('No variants found in product!');
            }
        } catch (error) {
            console.error('Failed to fetch product from backend:', error);
            setProduct(null);
            setMessage('Product not found or backend is not available.');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async () => {
        try {
            if (isAuthenticated) {
                // Validate that we have a variant selected
                if (!selectedVariant || !selectedVariant.variant_id) {
                    setMessage('Please select a product variant first');
                    setTimeout(() => setMessage(''), 3000);
                    return;
                }

                console.log('Adding to cart:', {
                    variant_id: selectedVariant.variant_id,
                    quantity: quantity,
                    selectedVariant: selectedVariant
                });

                // Backend expects: { variant_id, quantity }
                const response = await apiClient.post('/cart/add', {
                    variant_id: selectedVariant.variant_id,
                    quantity: quantity
                });
                console.log('Cart add response:', response.data);
                setMessage('Added to cart!');
            } else {
                // Guest cart - store with all needed info
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                guestCart.push({
                    variant_id: selectedVariant?.variant_id,
                    product_id: product.product_id,
                    brand: product.brand,
                    model_name: product.model_name,
                    color: selectedVariant?.color,
                    ram: selectedVariant?.ram,
                    storage: selectedVariant?.storage,
                    quantity: quantity,
                    price: selectedVariant?.price || product.base_price,
                    image_url: imageUrl
                });
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                setMessage('Added to cart!');
            }
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            // Show actual backend error for debugging
            const errorDetail = error.response?.data?.detail;
            let errorMessage = 'Failed to add to cart';

            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map(err => {
                    const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
                    const msg = err.msg || 'is required';
                    return `${field}: ${msg}`;
                }).join(', ');
            }

            setMessage(errorMessage);
            console.error('Error adding to cart:', error);
            console.error('Selected variant was:', selectedVariant);
            console.error('Variants available:', variants);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const addToWishlist = async () => {
        try {
            if (isAuthenticated) {
                // Backend expects: { product_id }
                // Use id from URL since product object might not have product_id
                await apiClient.post('/wishlist/add', {
                    product_id: parseInt(id)
                });
                setMessage('Added to wishlist!');
            } else {

                const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
                guestWishlist.push({
                    product_id: parseInt(id),
                    brand: product.brand,
                    model_name: product.model_name,
                    base_price: selectedVariant?.price || product.base_price,
                    image_url: selectedVariant?.image_url || product.image_url
                });
                localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
                setMessage('Added to wishlist!');
            }
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            let errorMessage = 'Failed to add to wishlist';

            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map(err => {
                    const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
                    const msg = err.msg || 'is required';
                    return `${field}: ${msg}`;
                }).join(', ');
            }

            setMessage(errorMessage);
            console.error('Error adding to wishlist:', error);
            console.error('Product ID sent:', product.product_id);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="error-notice">
                    <p>Product not found</p>
                </div>
            </div>
        );
    }

    const getValidImageUrl = (variant, product) => {
        const variantImage = variant?.image_url;
        const productImage = product?.image_url;
        const fallbackImage = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80';

        // Check if variant image is a valid URL string (not a color name like "Titanium Silver")
        if (variantImage && (variantImage.startsWith('http') || variantImage.startsWith('/'))) {
            return variantImage;
        }

        // Fallback to product image if valid
        if (productImage && (productImage.startsWith('http') || productImage.startsWith('/'))) {
            return productImage;
        }

        return fallbackImage;
    };

    const imageUrl = getValidImageUrl(selectedVariant, product);

    const uniqueColors = [...new Set(variants.map(v => v.color))];
    const filteredVariants = selectedColor 
        ? variants.filter(v => v.color === selectedColor)
        : variants;

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        const firstVariantOfColor = variants.find(v => v.color === color);
        if (firstVariantOfColor) {
            setSelectedVariant(firstVariantOfColor);
        }
    };

    return (
        <div className="product-detail-page">
            {message && (
                <div className={`message ${message.includes('Failed') || message.includes('Error') || message.includes('failed') || message.includes('error') || message.includes('invalid') || message.includes('Invalid') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="product-detail-container">
                <div className="product-image-section">
                    <div className="product-badges">
                        {selectedVariant?.stock_qty === 0 && (
                            <span className="badge badge-out-of-stock">Out of Stock</span>
                        )}
                    </div>
                    <div className="product-image-large">
                        <img
                            src={imageUrl}
                            alt={product.model_name}
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80';
                            }}
                        />
                    </div>
                </div>

                <div className="product-details">
                    <span className="product-brand">{product.brand}</span>
                    <h1>{product.model_name}</h1>
                    
                    <div className="product-price-section">
                        <span className="current-price">₹{(selectedVariant?.price || product.base_price).toLocaleString()}</span>
                    </div>

                    <p className="product-description">{product.description}</p>

                    {variants.length > 0 && (
                        <div className="variants-section">
                            <h3>Select Color</h3>
                            <div className="color-options">
                                {uniqueColors.map((color) => (
                                    <button
                                        key={color}
                                        className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                                        onClick={() => handleColorSelect(color)}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>

                            <h3>Select Variant</h3>
                            <div className="variants-list">
                                {filteredVariants.map((variant) => (
                                    <button
                                        key={variant.variant_id}
                                        className={`variant-btn ${selectedVariant?.variant_id === variant.variant_id ? 'active' : ''} ${variant.stock_qty === 0 ? 'out-of-stock' : ''}`}
                                        onClick={() => variant.stock_qty > 0 && setSelectedVariant(variant)}
                                        disabled={variant.stock_qty === 0}
                                    >
                                        <strong>{variant.ram}/{variant.storage}</strong>
                                        <span>₹{variant.price.toLocaleString()}</span>
                                        {variant.stock_qty > 0 && (
                                            <span className="stock-info">{variant.stock_qty} in stock</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="quantity-section">
                        <label>Quantity</label>
                        <div className="quantity-controls">
                            <button 
                                className="quantity-btn"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >−</button>
                            <input
                                type="number"
                                min="1"
                                max={selectedVariant?.stock_qty || 99}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="quantity-input"
                            />
                            <button 
                                className="quantity-btn"
                                onClick={() => setQuantity(Math.min(selectedVariant?.stock_qty || 99, quantity + 1))}
                            >+</button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            onClick={addToCart}
                            className="add-to-cart-btn"
                            disabled={selectedVariant && selectedVariant.stock_qty === 0}
                        >
                            {selectedVariant && selectedVariant.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button onClick={addToWishlist} className="add-to-wishlist-btn">
                            ♡
                        </button>
                    </div>

                    <div className="product-meta">
                        <div className="meta-item">
                            <strong>Brand:</strong> {product.brand}
                        </div>
                        <div className="meta-item">
                            <strong>Category:</strong> Smartphone
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
