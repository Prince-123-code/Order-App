function OrderCard({ order }) {
    return (
        <div className="card">
            <h3>Order #{order.id}</h3>
            <p>User: {order.userId}</p>
        </div>
    );
}

export default OrderCard;