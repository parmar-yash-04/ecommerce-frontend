import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import { generateInvoice } from '../utils/generateInvoice';

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
            // Backend returns: List[OrderResponse]
            // OrderResponse: { order_id, order_number, total_amount, order_status, created_at, items: [...] }
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

    return (
        <div className="orders-page">
            <h1>My Orders</h1>

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

                            <div className="order-action-buttons">
                                <button
                                    onClick={() => generateInvoice({ order, items: order.items || [] })}
                                    className="btn btn-primary"
                                >
                                    📄 Invoice
                                </button>
                                <button
                                    onClick={() => viewOrderDetails(order.order_id)}
                                    className="btn btn-secondary"
                                >
                                    View Details & Track
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
