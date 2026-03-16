import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";

function Orders() {

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const role = localStorage.getItem("role");


    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        const res = await api.get("/orders");
        setOrders(res.data);
    };

    const fetchProducts = async () => {
        const res = await api.get("/products");
        setProducts(res.data);
    };

    const getUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            return decoded.userId || decoded.sub;
        } catch (e) {
            return null;
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.post(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update order status");
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await api.delete(`/orders/${orderId}`);
            fetchOrders();
        } catch (error) {
            console.error("Failed to cancel order", error);
            alert("Failed to cancel order");
        }
    };

    const getStatusClass = (status) => {
        return (status || 'ORDER_ITEMS').toLowerCase();
    };

    const OrderStatusTimeline = ({ currentStatus }) => {
        const statuses = ['ORDER_ITEMS', 'CONFIRMED', 'PROCESSING', 'DELIVERED'];
        const isCancelled = currentStatus === 'CANCELLED';
        const currentIndex = statuses.indexOf(currentStatus);
        
        // Progress percentage for the line
        const getProgress = () => {
            if (isCancelled) return 100;
            if (currentIndex === -1) return 0;
            return (currentIndex / (statuses.length - 1)) * 100;
        };

        return (
            <div className="status-timeline-container">
                <div className={`status-timeline ${isCancelled ? 'cancelled' : ''}`}>
                    <div className="timeline-line-base"></div>
                    <div className="timeline-line-fill" style={{ width: `${getProgress()}%` }}></div>
                    
                    {statuses.map((s, idx) => (
                        <div key={s} className={`timeline-step ${idx < currentIndex ? 'completed' : (idx === currentIndex ? 'active' : '')}`}>
                            <div className="step-node">
                                {idx < currentIndex && <span>✓</span>}
                            </div>
                            <span className="step-label">{s.replace('_', ' ')}</span>
                        </div>
                    ))}

                    {isCancelled && (
                        <div className="timeline-step active">
                            <div className="step-node">❌</div>
                            <span className="step-label">CANCELLED</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <Navbar />
            <div className="orders-page-header">
                <h2>{role === "ADMIN" ? "Manage All Orders" : "Your Order History"}</h2>
                <p className="orders-page-subtitle">Track your culinary journey from our kitchen to your table.</p>
            </div>

            <div className="order-history-list">
                {orders.map((o) => (
                    <div key={o.id} className="order-card-v3">
                        <div className="order-card-v3__header">
                            <div className="order-card-v3__id-group">
                                <h3>Order #{o.id}</h3>
                                <span className="order-card-v3__date">
                                    Placed on {new Date(o.createdAt).toLocaleDateString()}
                                </span>
                                {role === "ADMIN" && (
                                    <div className="order-card-v3__customer">
                                        👤 {o.user?.name || `ID: ${o.userId}`}
                                    </div>
                                )}
                            </div>
                            <div className="order-card-v3__meta">
                                <span className="order-card-v3__total">
                                    ${o.items?.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0).toFixed(2)}
                                </span>
                                <span className="order-card-v3__item-count">
                                    {o.items?.length || 0} {o.items?.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                        </div>

                        <div className="order-card-v3__status-section">
                            <OrderStatusTimeline currentStatus={o.status || 'ORDER_ITEMS'} />
                        </div>

                        <div className="order-card-v3__content">
                            <div className="order-card-v3__items-summary">
                                {o.items?.map(item => (
                                    <div key={item.id} className="order-card-v3__item-pill">
                                        {item.product?.name} <span>x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-card-v3__actions">
                                {role === "ADMIN" ? (
                                    <div className="admin-status-wrapper">
                                        <span className="admin-status-label">Update Status:</span>
                                        <select 
                                            value={o.status || 'ORDER_ITEMS'} 
                                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                            className="order-status-select"
                                            disabled={o.status === 'CANCELLED' || o.status === 'DELIVERED'}
                                        >
                                            <option value="ORDER_ITEMS">Order Items</option>
                                            <option value="CONFIRMED">Confirm Order</option>
                                            <option value="PROCESSING">Send to Processing</option>
                                            <option value="DELIVERED">Mark Delivered</option>
                                            <option value="CANCELLED">Cancel Order</option>
                                        </select>
                                    </div>
                                ) : (
                                    <button
                                        className="order-card-v3__btn-cancel"
                                        onClick={() => cancelOrder(o.id)}
                                        disabled={o.status !== 'ORDER_ITEMS'}
                                        title={o.status !== 'ORDER_ITEMS' ? "Cannot cancel once order is confirmed" : "Cancel this order"}
                                    >
                                        ❌ Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="empty-orders-message">
                        <div className="empty-orders-icon">📦</div>
                        <h3>No orders yet</h3>
                        <p>When you place an order, it will appear here with its real-time status.</p>
                        <button onClick={() => navigate('/products')} className="btn-hero-primary">Browse Menu</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;