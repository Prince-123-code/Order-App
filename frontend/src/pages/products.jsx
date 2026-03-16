import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import { useCart } from "../context/CartContext";

function Products() {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [imageError, setImageError] = useState(false);
    const [imageValid, setImageValid] = useState(false);
    const [editId, setEditId] = useState(null);
    const role = localStorage.getItem("role");
    const formRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await api.get("/products");
        setProducts(res.data);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if image URL is valid before saving
    const handleImageChange = (url) => {
        setImage(url);
        setImageError(false);
        setImageValid(false);

        if (!url.trim()) return; // empty is fine, just no image

        const img = new Image();
        img.onload = () => { setImageValid(true); setImageError(false); };
        img.onerror = () => { setImageValid(false); setImageError(true); };
        img.src = url;
    };

    const addProduct = async () => {
        if (image && imageError) {
            alert("Please fix the image URL or clear it before saving.");
            return;
        }
        try {
            await api.post("/products", {
                name,
                price: parseFloat(price),
                description: description || undefined,
                image: (image && imageValid) ? image : undefined
            });
            resetForm();
            fetchProducts();
            alert("Product created successfully!");
        } catch (err) {
            alert("Failed to create product. Please try again.");
        }
    };

    const deleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
            alert("Product deleted successfully!");
        } catch (err) {
            alert("Failed to delete product. Please try again.");
        }
    };

    const updateProduct = async () => {
        if (image && imageError) {
            alert("Please fix the image URL or clear it before saving.");
            return;
        }
        try {
            await api.put(`/products/${editId}`, {
                name,
                price: parseFloat(price),
                description: description || undefined,
                image: (image && imageValid) ? image : undefined
            });
            resetForm();
            fetchProducts();
            alert("Product updated successfully!");
        } catch (err) {
            alert("Failed to update product. Please try again.");
        }
    };

    const resetForm = () => {
        setEditId(null);
        setName("");
        setPrice("");
        setDescription("");
        setImage("");
        setImageError(false);
        setImageValid(false);
    };

    const editProduct = (product) => {
        setEditId(product.id);
        setName(product.name);
        setPrice(product.price);
        setDescription(product.description || "");
        setImage(product.image || "");
        setImageError(false);
        setImageValid(!!product.image);

        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="page-container">
            <Navbar />
            <h2>Products Management</h2>

            {role === "ADMIN" && (
                <div className="card product-form" ref={formRef}>
                    <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
                    <input
                        placeholder="Product Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        placeholder="Price ($)"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    <input
                        placeholder="Description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        placeholder="Image URL"
                        value={image}
                        onChange={(e) => handleImageChange(e.target.value)}
                        style={imageError ? { borderColor: '#e74c3c' } : {}}
                    />
                    
                    {/* Show error if image URL is invalid */}
                    {image && imageError && (
                        <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '12px' }}>
                            ⚠ Invalid image URL – please enter a valid image link
                        </p>
                    )}

                    {/* Show preview only if image loaded successfully */}
                    {image && imageValid && (
                        <div className="product-form__preview">
                            <span className="product-form__preview-label">Image Preview:</span>
                            <img src={image} alt="Preview" />
                        </div>
                    )}

                    {editId ? (
                        <div className="product-form__actions">
                            <button onClick={updateProduct}>Update</button>
                            <button onClick={resetForm} className="product-form__btn--cancel">Cancel</button>
                        </div>
                    ) : (
                        <button onClick={addProduct}>Create Product</button>
                    )}
                </div>
            )}

            <div className="search-container">
                <input
                    className="search-input"
                    placeholder="Search products by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>

            <div className="grid">
                {filteredProducts.map((p) => (
                    <div key={p.id} className="card product-card">
                        {p.image && <img src={p.image} alt={p.name} className="product-card__image" />}
                        <h3>{p.name}</h3>
                        <p className="product-card__price">
                            ${p.price}
                        </p>
                        {p.description && <p className="product-card__description">{p.description}</p>}

                        {role === "ADMIN" ? (
                            <div className="product-actions">
                                <button onClick={() => editProduct(p)} className="product-btn--edit">Edit</button>
                                <button onClick={() => deleteProduct(p.id)} className="product-btn--delete">Delete</button>
                            </div>
                        ) : (
                            <div className="product-actions">
                                {role === "USER" ? (
                                    <button 
                                        onClick={() => {
                                            addToCart(p);
                                            navigate('/cart');
                                        }} 
                                        className="product-btn--order"
                                    >
                                        Add to Cart
                                    </button>
                                ) : (
                                    <button onClick={() => window.location.href = '/login'} className="product-btn--login-prompt">Login to Order</button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Products;