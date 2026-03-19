import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import api from "../services/api";

function Dashboard() {
    const role = localStorage.getItem("role");
    const [stats, setStats] = useState({ products: 0, orders: 0 });
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await api.get("/products/top-selling");
                setFeaturedProducts(res.data);
            } catch (e) {
                console.error("Failed to fetch top selling products", e);
            }
        };

        fetchFeatured();

        if (role === 'ADMIN') {
            const fetchStats = async () => {
                try {
                    const res = await api.get("/orders/analytics/stats");
                    setStats({ 
                        products: res.data.productsCount, 
                        orders: res.data.ordersCount 
                    });
                } catch (e) {
                    console.error("Failed to fetch stats", e);
                }
            };
            fetchStats();
        }
    }, [role]);


    return (
        <div className="page-container">
            <Navbar />
            <h2>Dashboard</h2>

            <div className="dashboard-content">
                {role === 'ADMIN' && (
                    <section className="admin-stats-bar">
                        <div className="stat-card">
                            <span className="stat-value">{stats.products}</span>
                            <span className="stat-label">Total Products</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{stats.orders}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                    </section>
                )}

                <section className="dashboard-hero-v2">
                    <div className="dashboard-hero__text">
                        <h1 className="hero-title">Delicious Food, <br /> Delivered to Your Door.</h1>
                        <p className="hero-subtitle">Experience the finest culinary delights from our kitchen to your table. Fresh ingredients, expertly prepared, and served with love.</p>
                        <div className="hero-actions">
                            <button onClick={() => window.location.href = '/products'} className="btn-hero-primary">Explore Menu</button>
                            <button onClick={() => window.location.href = '/orders'} className="btn-hero-secondary">View Orders</button>
                        </div>
                    </div>
                </section>

                <section className="dashboard-specialties">
                    <h2 className="section-title">Our Specials</h2>
                    <div className="specialties-grid">
                        <div className="specialty-card">
                            <div className="specialty-icon breakfast-icon">🍳</div>
                            <h3>Healthy Breakfast</h3>
                            <p>Start your day with our nutritious and energy-packed morning meals.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon lunch-icon">🍱</div>
                            <h3>Power Lunch</h3>
                            <p>Recharge your day with our balanced, nutrient-rich midday feasts.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon dinner-icon">🍝</div>
                            <h3>Gourmet Dinner</h3>
                            <p>Exquisite evening meals prepared by our world-class chefs.</p>
                        </div>
                    </div>
                </section>

                <section className="featured-products-section">
                    <h2 className="section-title">Top Featuring Products</h2>
                    <p className="section-subtitle">Discover our most popular items</p>
                    <div className="featured-grid">
                        {featuredProducts.map(product => (
                            <div key={product.id} className="featured-product-card">
                                <div className="product-image-container">
                                    <img src={product.image || "https://via.placeholder.com/300x200?text=No+Image"} alt={product.name} />
                                    <span className={`category-badge ${product.category?.toLowerCase() || 'veg'}`}>
                                        {product.category === 'NON-VEG' ? 'Non-Veg' : 'Veg'}
                                    </span>
                                </div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="product-price">${product.price}</p>
                                    <div className="featured-actions">
                                        <button onClick={() => window.location.href = '/products'} className="btn-view-details">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {featuredProducts.length === 0 && <p className="no-products-msg">No trending products available yet.</p>}
                </section>

            </div>
            <Footer />
        </div>
    );
}

export default Dashboard;