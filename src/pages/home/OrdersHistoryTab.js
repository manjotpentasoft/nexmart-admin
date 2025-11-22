import React, { useEffect, useState } from "react";
import "../../styles/home/UserAccountPage.css";
import { subscribeToUserOrders } from "../../firebase/ordersService";

const OrdersHistoryTab = ({ userId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }

    const unsub = subscribeToUserOrders(userId, (ordersData) => {
      if (!ordersData) return;

      // Normalize timestamps and ensure data shape
      const formattedOrders = ordersData.map((order) => ({
        ...order,
        createdAt: order.createdAt?.toDate?.() || new Date(),
        products: order.products || [],
        status: order.status || "Pending",
        total: order.total || 0,
      }));

      // Sort descending by createdAt
      formattedOrders.sort((a, b) => b.createdAt - a.createdAt);

      setOrders(formattedOrders);
    });

    return () => unsub && unsub();
  }, [userId]);

  return (
    <div className="order-history-tab">
      <h3>Order History</h3>

      {orders.length === 0 ? (
        <p className="order-history-empty">You haven’t placed any orders yet.</p>
      ) : (
        <table className="order-history-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <div className="order-history-products">
                    {order.products.slice(0, 2).map((p) => (
                      <div key={p.id} className="order-history-product-item">
                        <img src={p.image || "/default-product.png"} alt={p.name} />
                        <span>{p.name}</span>
                      </div>
                    ))}
                    {order.products.length > 2 && (
                      <span className="order-history-more-products">
                        +{order.products.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td>₹{order.total.toLocaleString()}</td>
                <td>
                  <span
                    className={`order-history-badge ${
                      order.status.toLowerCase() === "delivered"
                        ? "delivered"
                        : order.status.toLowerCase() === "shipped"
                        ? "shipped"
                        : "pending"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersHistoryTab;
