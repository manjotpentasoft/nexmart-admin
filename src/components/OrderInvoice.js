import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import AdminLayout from "./AdminLayout";
import "../styles/OrderInvoice.css";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function OrderInvoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!orderId) return;

  setLoading(true);

  // Listen for any matching order across all users
  const q = query(collectionGroup(db, "orders"));
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    // Find the order with matching ID in the full path
    const match = snapshot.docs.find((doc) => doc.id === orderId);

    if (!match) {
      setOrder(null);
      setLoading(false);
      return;
    }

    const data = match.data();

    // Convert Firestore timestamp to JS Date
    if (data.createdAt?.seconds) {
      data.createdAt = new Date(data.createdAt.seconds * 1000);
    }

    // Fetch product details
    const itemsWithDetails = await Promise.all(
      (data.items || []).map(async (item) => {
        if (item.productId) {
          const productSnap = await getDoc(doc(db, "products", item.productId));
          if (productSnap.exists()) {
            const productData = productSnap.data();
            return {
              ...item,
              name: productData.name,
              brand: productData.brand,
              category: productData.category,
              price: productData.price || item.price || 0,
              oldPrice: productData.oldPrice || 0,
              image: productData.image || "",
            };
          }
        }
        return {
          ...item,
          name: item.name || "Unknown Product",
          price: item.price || 0,
        };
      })
    );

    setOrder({ id: match.id, ...data, items: itemsWithDetails });
    setLoading(false);
  });

  return () => unsubscribe();
}, [orderId]);


  if (loading) return <div className="loader"></div>;
  if (!order) return <p>Order not found.</p>;

  const calculateSubtotal = (item) => (item.price || 0) * (item.quantity || 0);
  const calculateTotal = () =>
    (order.items || []).reduce(
      (sum, item) => sum + calculateSubtotal(item),
      0
    ) + (order.shipping || 0);

  return (
    <AdminLayout>
      <div className="main-content">
        <div className="content-area">
          <div className="invoice-container">
            <div className="invoice-header">
              <h2>Order Invoice</h2>
              <div className="invoice-actions">
                <button onClick={() => navigate(-1)} className="btn back-btn">
                  Back
                </button>
                <button onClick={() => window.print()} className="btn back-btn">
                  Print
                </button>
              </div>
            </div>

            <div className="invoice-card">
              <div className="invoice-details">
                <div className="invoice-main-info">
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {order.createdAt?.toLocaleString() || "-"}
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    <span
                      className={`badge ${
                        order.paymentStatus === "Paid"
                          ? "badge-green"
                          : "badge-red"
                      }`}
                    >
                      {order.paymentStatus || "Pending"}
                    </span>
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {order.paymentMethod || "COD"}
                  </p>
                </div>

                <div className="invoice-addresses">
                  {order.billing && (
                    <div className="invoice-address-card">
                      <h4>Billing Address</h4>
                      <p>
                        <strong>
                          {order.billing.firstName} {order.billing.lastName}
                        </strong>
                      </p>
                      {order.billing.email && (
                        <p>
                          <FaEnvelope /> {order.billing.email}
                        </p>
                      )}
                      {order.billing.phone && (
                        <p>
                          <FaPhone /> {order.billing.phone}
                        </p>
                      )}
                      {order.billing.address && (
                        <p>
                          <FaMapMarkerAlt /> {order.billing.address},{" "}
                          {order.billing.city}, {order.billing.country} -{" "}
                          {order.billing.postcode}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.length > 0 ? (
                    order.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.brand || "-"}</td>
                        <td>{item.category || "-"}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price?.toLocaleString()}</td>
                        <td>₹{calculateSubtotal(item).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>No products in this order</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="invoice-summary">
                <p>
                  <strong>Shipping Charges:</strong> ₹
                  {(order.shipping || 0).toLocaleString()}
                </p>
                <h3>Total Amount: ₹{calculateTotal().toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrderInvoice;
