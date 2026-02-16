import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import generateInvoice from '../utils/generateInvoice';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/orders/my');
            setOrders(response.data);
        } catch (err) {
            setError('Failed to load orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewOrderDetails = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const handleDownloadInvoice = (order) => {
        console.log('Attempting to download invoice for order:', order);
        try {
            generateInvoice(order);
            console.log('Invoice generation triggered');
        } catch (error) {
            console.error('Invoice generation failed:', error);
            alert('Failed to generate invoice: ' + error.message);
        }
    };

    return (
        <div className="orders-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <h1>My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary">
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.order_id} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.order_number}</h3>
                                <span className={`order-status status-${order.order_status.toLowerCase()}`}>
                                    {order.order_status}
                                </span>
                            </div>

                            <div className="order-details">
                                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                                <p><strong>Total:</strong> ₹{order.total_amount.toFixed(2)}</p>
                                <p><strong>Items:</strong> {order.items?.length || 0}</p>
                            </div>

                            <div className="order-actions">
                                <button
                                    onClick={() => viewOrderDetails(order.order_id)}
                                    className="btn btn-secondary"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleDownloadInvoice(order)}
                                    className="btn btn-primary"
                                    style={{ marginLeft: '10px' }}
                                >
                                    Download Invoice
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
