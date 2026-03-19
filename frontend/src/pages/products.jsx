import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function Products() {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [imageError, setImageError] = useState(false);
    const [imageValid, setImageValid] = useState(false);
    const [category, setCategory] = useState("VEG");
    const [editId, setEditId] = useState(null);
    const role = localStorage.getItem("role");
    const formRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [errors, setErrors] = useState({});
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12;
    const controlsRef = useRef(null);
    const isFirstRender = useRef(true);


    useEffect(() => {
        // Fetch products whenever page, search term, or category changes
        fetchProducts();
    }, [page, searchTerm, filterCategory]);

    useEffect(() => {
        // When filters change, reset page to 1
        setPage(1);
    }, [searchTerm, filterCategory]);

    useEffect(() => {
        // Scroll to controls when page changes (skip first render)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (controlsRef.current) {
            controlsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [page]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products?search=${searchTerm}&category=${filterCategory}&page=${page}&limit=${limit}`);
            setProducts(res.data.data);
            setTotalPages(res.data.meta.lastPage);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };



    const validateField = (fieldName, value) => {
        let error = "";
        if (fieldName === "name" && !value.trim()) error = "Product name is required";
        if (fieldName === "price" && (!value || isNaN(value) || parseFloat(value) <= 0)) error = "Valid price is required";
        if (fieldName === "description" && !value.trim()) error = "Description is required";
        if (fieldName === "image" && !value.trim()) error = "Image URL is required";
        if (fieldName === "category" && !value) error = "Category is required";
        
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return !error;
    };

    const validateForm = () => {
        const isNameValid = validateField("name", name);
        const isPriceValid = validateField("price", price);
        const isDescValid = validateField("description", description);
        const isImageFieldValid = validateField("image", image);
        const isCategoryValid = validateField("category", category);
        
        if (image && imageError) {
            setErrors(prev => ({ ...prev, image: "Please provide a valid image URL" }));
            return false;
        }

        return isNameValid && isPriceValid && isDescValid && isImageFieldValid && isCategoryValid && !imageError;
    };



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
        if (!validateForm()) return;
        try {
            await api.post("/products", {
                name,
                price: parseFloat(price),
                description: description || undefined,
                image: (image && imageValid) ? image : undefined,
                category
            });
            resetForm();
            fetchProducts();
            showToast("Product created successfully!", "success");
        } catch (err) {
            alert("Failed to create product. Please try again.");
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
            showToast("Product deleted successfully!", "success");
        } catch (err) {
            alert("Failed to delete product. Please try again.");
        }
    };

    const updateProduct = async () => {
        if (!validateForm()) return;
        try {
            await api.put(`/products/${editId}`, {
                name,
                price: parseFloat(price),
                description: description || undefined,
                image: (image && imageValid) ? image : undefined,
                category
            });
            resetForm();
            fetchProducts();
            showToast("Product updated successfully!", "success");
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
        setCategory("VEG");
        setErrors({});
    };

    const editProduct = (product) => {
        setEditId(product.id);
        setName(product.name);
        setPrice(product.price);
        setDescription(product.description || "");
        setImage(product.image || "");
        setImageError(false);
        setImageValid(!!product.image);
        setCategory(product.category || "VEG");
        setErrors({});

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
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) validateField("name", e.target.value);
                        }}
                        onBlur={() => validateField("name", name)}
                        style={errors.name ? { borderColor: '#e74c3c' } : {}}
                    />
                    {errors.name && <p className="field-error">{errors.name}</p>}

                    <input
                        placeholder="Price ($)"
                        type="number"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value);
                            if (errors.price) validateField("price", e.target.value);
                        }}
                        onBlur={() => validateField("price", price)}
                        style={errors.price ? { borderColor: '#e74c3c' } : {}}
                    />
                    {errors.price && <p className="field-error">{errors.price}</p>}

                    <input
                        placeholder="Description..."
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            if (errors.description) validateField("description", e.target.value);
                        }}
                        onBlur={() => validateField("description", description)}
                        style={errors.description ? { borderColor: '#e74c3c' } : {}}
                    />
                    {errors.description && <p className="field-error">{errors.description}</p>}

                    <input
                        placeholder="Image URL"
                        value={image}
                        onChange={(e) => {
                            handleImageChange(e.target.value);
                            if (errors.image) validateField("image", e.target.value);
                        }}
                        onBlur={() => validateField("image", image)}
                        style={(errors.image || (image && imageError)) ? { borderColor: '#e74c3c' } : {}}
                    />
                    {errors.image && <p className="field-error">{errors.image}</p>}
                    
                    
                    {/* Show error if image URL is invalid */}
                    {image && imageError && (
                        <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '12px' }}>
                            ⚠ Invalid image URL – please enter a valid image link
                        </p>
                    )}

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                validateField("category", e.target.value);
                            }}
                            className="form-select"
                        >
                            <option value="VEG">Veg</option>
                            <option value="NON-VEG">Non-Veg</option>
                        </select>
                    </div>

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

            <div className="product-controls-v3" ref={controlsRef}>
                <div className="search-bar-v3">
                    <div className="search-icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        className="search-input-v3"
                        placeholder="Search for dishes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="search-clear" onClick={() => setSearchTerm("")}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>

                <div className="category-chips">
                    <button 
                        className={`chip ${filterCategory === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilterCategory('ALL')}
                    >
                        All
                    </button>
                    <button 
                        className={`chip chip--veg ${filterCategory === 'VEG' ? 'active' : ''}`}
                        onClick={() => setFilterCategory('VEG')}
                    >
                        <span className="chip-dot"></span> Veg
                    </button>
                    <button 
                        className={`chip chip--non-veg ${filterCategory === 'NON-VEG' ? 'active' : ''}`}
                        onClick={() => setFilterCategory('NON-VEG')}
                    >
                        <span className="chip-dot"></span> Non-Veg
                    </button>
                </div>
            </div>

            <div className="grid">
                {products.map((p) => (
                    <div key={p.id} className="card product-card">
                        <div className="product-card__header">
                            {p.image && <img src={p.image} alt={p.name} className="product-card__image" />}
                            <span className={`category-badge ${p.category?.toLowerCase() || 'veg'}`}>
                                {p.category === 'NON-VEG' ? 'Non-Veg' : 'Veg'}
                            </span>
                        </div>
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

            {!loading && products.length === 0 && (
                <p style={{ textAlign: 'center', color: '#7f8c8d', margin: '40px 0', fontStyle: 'italic' }}>
                    No products found.
                </p>
            )}
        </div>
    );
}

export default Products;