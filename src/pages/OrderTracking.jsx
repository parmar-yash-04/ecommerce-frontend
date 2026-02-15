import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            // GET /orders/{order_id}
            // Returns: OrderResponse { order_id, order_number, total_amount, order_status, created_at, items: [...] }
            const response = await apiClient.get(`/orders/${orderId}`);
            setOrder(response.data);
        } catch (err) {
            setError('Failed to load order details');
            console.error('Error fetching order:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTrackingSteps = (status) => {
        const normalizedStatus = status.toLowerCase();
        const steps = [
            { name: 'Order Placed', status: 'completed' },
            {
                name: 'Processing',
                status: normalizedStatus === 'pending' || normalizedStatus === 'processing'
                    ? 'active'
                    : (normalizedStatus === 'shipped' || normalizedStatus === 'delivered') ? 'completed' : 'pending'
            },
            {
                name: 'Shipped',
                status: normalizedStatus === 'shipped'
                    ? 'active'
                    : normalizedStatus === 'delivered' ? 'completed' : 'pending'
            },
            {
                name: 'Delivered',
                status: normalizedStatus === 'delivered' ? 'completed' : 'pending'
            }
        ];
        return steps;
    };

    if (loading) {
        return <div className="loading">Loading order details...</div>;
    }

    if (error || !order) {
        return (
            <div className="error-container">
                <p className="error">{error || 'Order not found'}</p>
                <button onClick={() => navigate('/orders')} className="btn btn-primary">
                    Back to Orders
                </button>
            </div>
        );
    }

    const trackingSteps = getTrackingSteps(order.order_status);

    return (
        <div className="order-tracking-page">
            <h1>Order Tracking</h1>

            <div className="order-info-card">
                <h2>Order #{order.order_number}</h2>
                <p><strong>Order ID:</strong> {order.order_id}</p>
                <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ₹{order.total_amount.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.order_status}</p>
            </div>

            {/* Tracking Timeline */}
            <div className="tracking-timeline">
                <h2>Order Status</h2>
                <div className="timeline">
                    {trackingSteps.map((step, index) => (
                        <div key={index} className={`timeline-step ${step.status}`}>
                            <div className="timeline-marker">
                                {step.status === 'completed' && '✓'}
                                {step.status === 'active' && '●'}
                                {step.status === 'pending' && '○'}
                            </div>
                            <div className="timeline-content">
                                <h3>{step.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Items */}
            <div className="order-items-section">
                <h2>Order Items</h2>
                {order.items && order.items.length > 0 ? (
                    <div className="order-items-list">
                        {order.items.map((item, index) => (
                            <div key={index} className="order-item">
                                <div className="item-info">
                                    <h3>Variant ID: {item.variant_id}</h3>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Price Each: ₹{item.price_each.toFixed(2)}</p>
                                </div>
                                <div className="item-price">
                                    <p>Subtotal: ₹{item.subtotal.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No items in this order</p>
                )}
            </div>

            <button onClick={() => navigate('/orders')} className="btn btn-secondary">
                Back to All Orders
            </button>
        </div>
    );
};

export default OrderTracking;
