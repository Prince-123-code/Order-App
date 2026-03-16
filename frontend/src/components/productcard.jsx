function ProductCard({ product, addToOrder }) {
    return (
        <div className="card">
            <h3>{product.name}</h3>
            <p>Price: {product.price}</p>

            <button onClick={() => addToOrder(product)}>
                Add to Order
            </button>
        </div>
    );
}

export default ProductCard;