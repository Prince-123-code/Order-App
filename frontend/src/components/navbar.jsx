import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
    const navigate = useNavigate();
    const { cartCount } = useCart();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        navigate("/dashboard");
    };

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userName = localStorage.getItem("userName");

    return (
        <nav className="navbar">
            <div className="navbar__left">
                <Link to="/dashboard" className="navbar__brand">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    AppMart
                </Link>
                <div className="navbar__links">
                    <Link to="/dashboard" className="navbar__link">Dashboard</Link>
                    <Link to="/products" className="navbar__link">Products</Link>
                    {token && <Link to="/orders" className="navbar__link">Orders</Link>}
                    {role === "ADMIN" && <Link to="/analytics" className="navbar__link">Analytics</Link>}
                </div>
            </div>
            
            <div className="navbar__actions">
                {token ? (
                    <>
                        <Link to="/cart" className="navbar__cart-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
                        </Link>
                        {userName && <span className="navbar__username">Hello, {userName}</span>}
                        {role && <span className="navbar__role">{role}</span>}
                        <button 
                            onClick={handleLogout} 
                            className="navbar__btn navbar__btn--logout"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={() => navigate("/login")} 
                            className="navbar__btn navbar__btn--login"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => navigate("/register")} 
                            className="navbar__btn navbar__btn--register"
                        >
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;