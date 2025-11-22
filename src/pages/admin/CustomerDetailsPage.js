import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import {
  collection,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/CustomerDetailsPage.css";

const CustomerDetailsPage = () => {
  const { id } = useParams(); // id = userId from /admin/customers/:id
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    //  Fetch customer info
    const fetchCustomerInfo = async () => {
      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCustomerInfo({
            name: userSnap.data().name || "Unknown",
            email: userSnap.data().email || "-",
            phone: userSnap.data().phone || "-",
          });
        } else {
          setCustomerInfo(null);
        }
      } catch (err) {
        console.error("Error fetching customer info:", err);
      }
    };

    //  Real-time subscription to user's orders
    const ordersRef = collection(db, "users", id, "orders");
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const ordersData = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort(
            (a, b) =>
              (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    fetchCustomerInfo();

    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="loader"></div>;
  if (!customerInfo)
    return (
      <AdminLayout>
        <p style={{ padding: "20px" }}>No customer found.</p>
      </AdminLayout>
    );

  const calculateTotalItems = (order) =>
    (order.products || []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

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
                    onClick={() =>
                      navigate(`/admin/orders/${order.id}`)
                    }
                  >
                    {order.id}
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(
                          order.createdAt.seconds * 1000
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`order-status-badge ${
                        order.status?.toLowerCase() || "pending"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td>{(order.products || []).length}</td>
                  <td>{calculateTotalItems(order)}</td>
                  <td>
                    ₹{order.total?.toLocaleString() || "0"}
                  </td>
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
