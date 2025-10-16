import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import AdminLayout from "./AdminLayout";
import "../styles/OrderInvoice.css";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function OrderInvoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(orderRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setOrder(null);
        setLoading(false);
        return;
      }

      const data = snapshot.data();

      // Convert Firestore timestamp to JS Date
      if (data.createdAt?.seconds) {
        data.createdAt = new Date(data.createdAt.seconds * 1000);
      }

      // Fetch product names and attributes
      const itemsWithDetails = await Promise.all(
        (data.items || []).map(async (item) => {
          if (item.productId) {
            const productSnap = await getDoc(doc(db, "products", item.productId));
            if (productSnap.exists()) {
              const productData = productSnap.data();
              return {
                ...item,
                name: productData.name,
                attribute: productData.attribute || "-",
              };
            }
          }
          return { ...item, name: "Unknown Product", attribute: "-" };
        })
      );

      setOrder({ id: snapshot.id, ...data, items: itemsWithDetails });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) return <div className="loader"></div>;
  if (!order) return <p>Order not found.</p>;

  const calculateSubtotal = (item) => (item.price || 0) * (item.quantity || 0);
  const calculateTotal = () =>
    (order.items || []).reduce((sum, item) => sum + calculateSubtotal(item), 0) +
    (order.tax || 0) +
    (order.shippingCost || 0);

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
                <button onClick={() => window.print()} className="btn print-btn">
                  Print
                </button>
              </div>
            </div>

            <div className="invoice-card">
              {/* <img src="/logo.png" alt="Logo" className="invoice-logo" /> */}

              <div className="invoice-details">
                <div className="invoice-main-info">
                  <p>
                    <strong>Transaction ID:</strong> {order.transactionId || order.id}
                  </p>
                  <p>
                    <strong>Order Date:</strong> {order.createdAt?.toLocaleString() || "-"}
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    <span
                      className={`badge ₹{
                        order.paymentStatus === "Paid" ? "badge-green" : "badge-red"
                      }`}
                    >
                      {order.paymentStatus || "Pending"}
                    </span>
                  </p>
                  <p>
                    <strong>Payment Method:</strong> {order.paymentMethod || "Cash On Delivery"}
                  </p>
                </div>

                <div className="invoice-addresses">
                  {/* {order.billing && (
                    <div className="invoice-address-card">
                      <h4>Billing Address</h4>
                      <p><strong>{order.billing.name}</strong></p>
                      {order.billing.email && (
                        <p><FaEnvelope /> {order.billing.email}</p>
                      )}
                      {order.billing.phone && (
                        <p><FaPhone /> {order.billing.phone}</p>
                      )}
                      {order.billing.address && (
                        <p><FaMapMarkerAlt /> {order.billing.address}</p>
                      )}
                    </div>
                  )} */}

                  {order.shipping && (
                    <div className="invoice-address-card">
                      <h4>Shipping Address</h4>
                      <p><strong>{order.shipping.name}</strong></p>
                      {order.shipping.email && (
                        <p><FaEnvelope /> {order.shipping.email}</p>
                      )}
                      {order.shipping.phone && (
                        <p><FaPhone /> {order.shipping.phone}</p>
                      )}
                      {order.shipping.address && (
                        <p><FaMapMarkerAlt /> {order.shipping.address}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    {/* <th>Attribute</th> */}
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.length > 0 ? (
                    order.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        {/* <td>{item.attribute}</td> */}
                        <td>{item.quantity}</td>
                        <td>₹{item.price?.toLocaleString()}</td>
                        <td>₹{calculateSubtotal(item).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No products in this order</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="invoice-summary">
                <p><strong>Tax:</strong> ₹{(order.tax || 0).toLocaleString()}</p>
                <p><strong>Shipping:</strong> ₹{(order.shippingCost || 0).toLocaleString()}</p>
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
