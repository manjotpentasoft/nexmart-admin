import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/CustomerDetailsPage.css";

const CustomerDetailsPage = () => {
  const { id } = useParams(); // id = customer email
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("shipping.email", "==", id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setOrders(ordersData);

        if (ordersData.length > 0) {
          const shipping = ordersData[0].shipping || {};
          setCustomerInfo({
            name: shipping.name || "Unknown",
            email: shipping.email || "-",
            phone: shipping.phone || "-",
          });
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="loader"></div>;
  if (!customerInfo) return <p>No orders found for this customer.</p>;

  const calculateTotalItems = (order) =>
    (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>Customer Details</h1>
          <p>Manage orders & customer info</p>
        </div>
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="customer-details-card">
        <div className="details-grid">
          <div className="details-label">Name</div>
          <div className="details-value">{customerInfo.name}</div>

          <div className="details-label">Email</div>
          <div className="details-value">{customerInfo.email}</div>

          <div className="details-label">Phone</div>
          <div className="details-value">{customerInfo.phone}</div>

          <div className="details-label">Total Orders</div>
          <div className="details-value">{orders.length}</div>
        </div>
      </div>

      <div className="orders-table-section" style={{ marginTop: "30px" }}>
        <h2>Orders History</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Products</th>
              <th>Total Items</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td
                    style={{ cursor: "pointer", color: "#4299e1" }}
                    onClick={() => navigate(`/admin/orders/invoice/${order.id}`)}
                  >
                    {order.id}
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`order-status-badge ${
                        order.orderStatus?.toLowerCase() || "pending"
                      }`}
                    >
                      {order.orderStatus || "Pending"}
                    </span>
                  </td>
                  <td>{(order.items || []).length}</td>
                  <td>{calculateTotalItems(order)}</td>
                  <td>${order.totalAmount?.toLocaleString() || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default CustomerDetailsPage;
