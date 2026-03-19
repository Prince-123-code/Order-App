import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import "../styles/analytics.css";

function Analytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/orders/analytics/stats");
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="analytics-loading">
            <div className="spinner"></div>
            <p>Gathering business insights...</p>
        </div>
    );

    return (
        <div className="page-container">
            <Navbar />
            <div className="analytics-page">
                <header className="analytics-header">
                    <h1>Business Analytics</h1>
                    <p>Track your business growth and performance metrics</p>
                </header>

                <div className="analytics-grid">
                    <div className="stat-card revenue">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>Total Revenue</h3>
                            <p className="stat-value">${(stats?.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="stat-card products">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <h3>Total Products</h3>
                            <p className="stat-value">{stats?.productsCount || 0}</p>
                        </div>
                    </div>

                    <div className="stat-card orders">
                        <div className="stat-icon">🛒</div>
                        <div className="stat-info">
                            <h3>Orders Placed</h3>
                            <p className="stat-value">{stats?.ordersCount || 0}</p>
                        </div>
                    </div>

                    <div className="stat-card customers">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Active Customers</h3>
                            <p className="stat-value">{stats?.activeCustomers || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="analytics-details">
                    <div className="sales-table-card">
                        <h2>Top Selling Products</h2>
                        <div className="sales-table-wrapper">
                            <table className="sales-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Quantity Sold</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.productSales?.length > 0 ? (
                                        stats.productSales.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.name}</td>
                                                <td>{product.quantity} units</td>
                                                <td>
                                                    <span className={`sales-badge ${product.quantity > 5 ? 'high' : 'normal'}`}>
                                                        {product.quantity > 5 ? 'Trending' : 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                                No sales data available yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
