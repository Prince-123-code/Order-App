import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Navbar from "../components/navbar";

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

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

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return alert("Your cart is empty");
        
        try {
            await api.post("/orders", {
                userId: getUserId(),
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            });
            clearCart();
            alert("Order placed successfully!");
            navigate("/orders");
        } catch (error) {
            console.error("Failed to place order", error);
            alert("Failed to place order. Please try again.");
        }
    };

    return (
        <div className="page-container">
            <Navbar />
            <div className="cart-page">
                <div className="cart-header">
                    <h2>Your Shopping Cart</h2>
                    <button onClick={() => navigate("/products")} className="btn-add-more">
                        Add More Products
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="card cart-empty">
                        <p>Your cart is empty.</p>
                        <button onClick={() => navigate("/products")} className="btn-primary">Browse Products</button>
                    </div>
                ) : (
                    <>
                        <div className="cart-list">
                            {cartItems.map(item => (
                                <div key={item.id} className="card cart-item">
                                    <div className="cart-item__info">
                                        <h3>{item.name}</h3>
                                        <p className="cart-item__price">${item.price} each</p>
                                    </div>
                                    <div className="cart-item__actions">
                                        <div className="quantity-controls">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                            <span className="quantity-display">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="btn-remove">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card cart-summary">
                            <div className="cart-summary__total">
                                <span>Total Amount:</span>
                                <strong>${cartTotal.toFixed(2)}</strong>
                            </div>
                            <button onClick={handlePlaceOrder} className="btn-place-order">
                                Place Order Now
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Cart;
