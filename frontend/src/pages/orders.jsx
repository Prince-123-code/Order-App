import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import { useSocket } from "../context/SocketContext";

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const role = localStorage.getItem("role");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12;
    const ordersHeaderRef = useRef(null);
    const isFirstRender = useRef(true);
    const socket = useSocket();


    useEffect(() => {
        fetchOrders();
    }, [page]);

    // Real-time WebSocket listeners
    useEffect(() => {
        if (!socket) return;

        // Admin: new order placed by any user → prepend to list
        const handleOrderCreated = (newOrder) => {
            if (role === "ADMIN") {
                setOrders(prev => [newOrder, ...prev]);
            }
        };

        // Both roles: status changed → update matching order in-place
        const handleOrderStatusUpdated = (updatedOrder) => {
            setOrders(prev =>
                prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)
            );
        };

        socket.on("order:created", handleOrderCreated);
        socket.on("order:statusUpdated", handleOrderStatusUpdated);

        return () => {
            socket.off("order:created", handleOrderCreated);
            socket.off("order:statusUpdated", handleOrderStatusUpdated);
        };
    }, [socket, role]);

    useEffect(() => {
        // Scroll to top when page changes (skip first render)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (ordersHeaderRef.current) {
            ordersHeaderRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/orders?page=${page}&limit=${limit}`);
            setOrders(res.data.data);
            setTotalPages(res.data.meta.lastPage);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
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
            const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
            const updatedOrder = res.data;
            
            // Update the local state directly for immediate UI feedback
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, ...updatedOrder } : order
            ));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update order status");
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await api.delete(`/orders/${orderId}`);
            const cancelledOrder = res.data;

            // Update local state directly
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, ...cancelledOrder } : order
            ));
        } catch (error) {
            console.error("Failed to cancel order", error);
            alert("Failed to cancel order");
        }
    };

    const getStatusClass = (status) => {
        return (status || 'PENDING').toLowerCase();
    };

    const OrderStatusTimeline = ({ currentStatus }) => {
        const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED'];
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
            <div className="orders-page-header" ref={ordersHeaderRef}>
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
                            <OrderStatusTimeline currentStatus={o.status || 'PENDING'} />
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
                                        <span className="admin-status-label">Manage Order:</span>
                                        <div className="admin-status-buttons">
                                            {o.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => updateOrderStatus(o.id, 'CONFIRMED')} className="btn-status-confirm">Confirm Order</button>
                                                    <button onClick={() => cancelOrder(o.id)} className="btn-status-cancel">Cancel Order</button>
                                                </>
                                            )}
                                            {o.status === 'CONFIRMED' && (
                                                <>
                                                    <button onClick={() => updateOrderStatus(o.id, 'PROCESSING')} className="btn-status-processing">Send to Processing</button>
                                                    <button onClick={() => cancelOrder(o.id)} className="btn-status-cancel">Cancel Order</button>
                                                </>
                                            )}
                                            {o.status === 'PROCESSING' && (
                                                <>
                                                    <button onClick={() => updateOrderStatus(o.id, 'DELIVERED')} className="btn-status-delivered">Mark Delivered</button>
                                                </>
                                            )}
                                            {o.status === 'DELIVERED' && <span className="status-badge-delivered">Order Delivered</span>}
                                            {o.status === 'CANCELLED' && <span className="status-badge-cancelled">Order Cancelled</span>}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className="order-card-v3__btn-cancel"
                                        onClick={() => cancelOrder(o.id)}
                                        disabled={o.status !== 'PENDING'}
                                        title={o.status !== 'PENDING' ? "Cannot cancel once order is confirmed" : "Cancel this order"}
                                    >
                                        ❌ Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && orders.length === 0 && (
                    <div className="empty-orders-message">
                        <div className="empty-orders-icon">📦</div>
                        <h3>No orders yet</h3>
                        <p>When you place an order, it will appear here with its real-time status.</p>
                        <button onClick={() => navigate('/products')} className="btn-hero-primary">Browse Menu</button>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-v3">
                    <button 
                        className="pagination-btn" 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        &laquo; Previous
                    </button>
                    
                    <div className="pagination-pages">
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i + 1}
                                className={`pagination-page ${page === i + 1 ? 'active' : ''}`}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button 
                        className="pagination-btn" 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next &raquo;
                    </button>
                </div>
            )}
        </div>
    );
}

export default Orders;