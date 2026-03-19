import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section brand">
                    <h2 className="footer-brand">AppMart</h2>
                    <p>Delicious food, delivered with care. Your daily companion for healthy and gourmet meals.</p>
                </div>
                
                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/dashboard">Home</Link></li>
                        <li><Link to="/products">Privacy Policy</Link></li>
                        <li><Link to="/products">Terms of Service</Link></li>
                    </ul>
                </div>
                
                <div className="footer-section contact">
                    <h3>Contact Us</h3>
                    <p>Email: support@appmart.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                </div>                                    
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} AppMart. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
