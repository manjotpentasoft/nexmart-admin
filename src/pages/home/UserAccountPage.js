import React, { useState, useEffect, useRef } from "react";
import "../../styles/home/UserAccountPage.css";
import Header from "../../components/home/Header";
import HighlightsSection from "../../components/home/HighlightSection";
import Footer from "../../components/home/Footer";
import WishlistPage from "./WishlistPage";
import {
  subscribeToUserData,
  subscribeToUserOrders,
  updateUserData,
} from "../../firebase/userService";
import { auth } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import OrdersHistoryTab from "./OrdersHistoryTab";

const UserAccountPage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const prevUserRef = useRef(null);
  const prevOrdersRef = useRef([]);

  /* Listen for auth + realtime updates */
  useEffect(() => {
    let unsubUser = null;
    let unsubOrders = null;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setOrders([]);
        setLoading(false);
        toast.info("You are logged out.");
        if (unsubUser) unsubUser();
        if (unsubOrders) unsubOrders();
        return;
      }

      unsubUser = subscribeToUserData(currentUser.uid, (data) => {
        if (!data) return;

        const newUser = {
          uid: currentUser.uid,
          name: data.name || "",
          email: data.email || "",
          profilePic: data.image || "/default-avatar.png",
          dateOfBirth: data.dateOfBirth || "",
          address: data.address || "",
          phone: data.phone || "",
          billing: data.billing || {},
        };

        if (
          prevUserRef.current &&
          JSON.stringify(prevUserRef.current) !== JSON.stringify(newUser)
        ) {
          toast.success("Profile information updated!");
        }

        prevUserRef.current = newUser;
        setUser(newUser);
        setLoading(false);
      });

      unsubOrders = subscribeToUserOrders(currentUser.uid, (ordersData) => {
        if (!ordersData) return;
        const formattedOrders = ordersData.map((order) => ({
          ...order,
          createdAt: order.createdAt?.toDate?.() || new Date(),
        }));

        if (
          prevOrdersRef.current.length &&
          formattedOrders.length > prevOrdersRef.current.length
        ) {
          const newOrder = formattedOrders.find(
            (o) => !prevOrdersRef.current.some((p) => p.id === o.id)
          );
          if (newOrder) toast.success(`New order placed: #${newOrder.id}`);
        }

        prevOrdersRef.current = formattedOrders;
        setOrders(formattedOrders);
      });
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  const handleUpdateUser = async (data) => {
    if (!user?.uid) return;
    try {
      await updateUserData(user.uid, data);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <>
      <Header />
      <div className="user-account-wrapper">
        <h2 className="user-account-title">My Account</h2>

        <div className="user-account-content">
          {/* Sidebar */}
          <aside className="user-account-sidebar">
            <div className="profile-box">
              <img
                src={user.profilePic}
                alt={user.name}
                className="profile-picture"
              />
              <h3 className="profile-name">{user.name}</h3>
              <p className="profile-email">{user.email}</p>
            </div>

            <nav className="account-nav">
              {["personal", "billing", "orders", "wishlist"].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => {
                    setActiveTab(tab);
                    setEditing(false);
                  }}
                >
                  {tab === "personal"
                    ? "Personal Information"
                    : tab === "billing"
                    ? "Billing and Payments"
                    : tab === "orders"
                    ? "Order History"
                    : "Wishlist"}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <section className="user-account-main">
            {activeTab === "personal" && !editing && (
              <PersonalInfoTab user={user} onEdit={() => setEditing(true)} />
            )}
            {editing && (
              <EditUserTab
                user={user}
                onUpdate={handleUpdateUser}
                onCancel={() => setEditing(false)}
              />
            )}
            {activeTab === "billing" && <BillingTab billing={user.billing} />}
            {activeTab === "orders" && <OrdersHistoryTab userId={user.uid} />}
            {activeTab === "wishlist" && <WishlistPage userId={user.uid} />}
          </section>
        </div>
      </div>
      <HighlightsSection />
      <Footer />
    </>
  );
};

export default UserAccountPage;

/* ========================
      SUBCOMPONENTS
======================== */

const PersonalInfoTab = ({ user, onEdit }) => (
  <div className="personal-info-section">
    <h3>Personal Information</h3>
    <p className="subtext">
      Manage your personal information, including your contact details.
    </p>
    <div className="info-cards">
      {[
        { label: "Name", value: user.name },
        { label: "Date of Birth", value: user.dateOfBirth },
        { label: "Address", value: user.address },
        { label: "Email", value: user.email },
        { label: "Phone", value: user.phone },
      ].map((item) => (
        <div className="info-card" key={item.label}>
          <div>
            <div className="label">{item.label}</div>
            <div className="value">{item.value}</div>
          </div>
          <span className="edit-link" onClick={onEdit}>
            Edit
          </span>
        </div>
      ))}
    </div>
  </div>
);

const EditUserTab = ({ user, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    dateOfBirth: user.dateOfBirth || "",
    address: user.address || "",
    phone: user.phone || "",
  });
  const [profileImage, setProfileImage] = useState(user.profilePic || null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setProfileImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate({ ...formData, image: profileImage });
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-user-section">
      <h3>Edit Personal Information</h3>
      <p className="subtext">Update your personal information below.</p>

      <form className="edit-user-form" onSubmit={handleSubmit}>
        <div className="profile-image-section">
          <div className="image-upload-container">
            <div className="current-image">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <FaUserCircle className="profile-avatar-icon" />
              )}
              <div className="image-upload-overlay">
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaCamera /> Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <p className="image-help-text">Recommended size: 40×40px</p>
          </div>
        </div>

        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Date of Birth", name: "dateOfBirth", type: "date" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "Address", name: "address", type: "text" },
        ].map((f) => (
          <div className="edit-user-field" key={f.name}>
            <label>{f.label}</label>
            <input
              type={f.type}
              name={f.name}
              value={formData[f.name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="edit-user-buttons">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const BillingTab = ({ billing }) => (
  <div className="billing-tab">
    <h3>Billing and Payments</h3>
    {billing?.cards?.length ? (
      <div className="billing-cards">
        {billing.cards.map((card, idx) => (
          <div className="billing-card" key={idx}>
            <div>Cardholder: {card.name}</div>
            <div>Card Number: **** **** **** {card.last4}</div>
            <div>Expiry: {card.expiry}</div>
          </div>
        ))}
      </div>
    ) : (
      <p>No saved payment methods.</p>
    )}
  </div>
);

// const OrdersHistoryTab = ({ orders }) => (
//   <div className="order-history-tab">
//     <h3>Order History</h3>

//     {orders.length === 0 ? (
//       <p className="order-history-empty">You haven’t placed any orders yet.</p>
//     ) : (
//       <table className="order-history-table">
//         <thead>
//           <tr>
//             <th>Order ID</th>
//             <th>Products</th>
//             <th>Total</th>
//             <th>Status</th>
//             <th>Date</th>
//             {/* <th>Actions</th> */}
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.id}>
//               <td className="order-history-id">{order.id}</td>

//               <td>
//                 <div className="order-history-products">
//                   {order.items?.slice(0, 2).map((item) => (
//                     <div key={item.id} className="order-history-product-item">
//                       <img src={item.image} alt={item.name} />
//                       <span>{item.name}</span>
//                     </div>
//                   ))}
//                   {order.items?.length > 2 && (
//                     <span className="order-history-more-products">
//                       +{order.items.length - 2} more
//                     </span>
//                   )}
//                 </div>
//               </td>

//               <td className="order-history-total">
//                 ₹{order.total?.toLocaleString() || 0}
//               </td>

//               <td>
//                 <span
//                   className={`order-history-badge ${
//                     order.orderStatus?.toLowerCase() === "delivered"
//                       ? "delivered"
//                       : order.orderStatus?.toLowerCase() === "shipped"
//                       ? "shipped"
//                       : "pending"
//                   }`}
//                 >
//                   {order.orderStatus || "Pending"}
//                 </span>
//               </td>

//               <td>
//                 {order.createdAt
//                   ? new Date(
//                       order.createdAt.seconds * 1000
//                     ).toLocaleDateString()
//                   : "-"}
//               </td>
//               {/* <td className="order-actions">
//                 <button
//                   className="order-view-btn"
//                   onClick={() => alert(`Viewing order #${order.id}`)}
//                 >
//                   View
//                 </button>
//                 <button
//                   className="order-invoice-btn"
//                   onClick={() => alert(`Downloading invoice for #${order.id}`)}
//                 >
//                   Invoice
//                 </button>
//               </td> */}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     )}
//   </div>
// );

/* ===== WishlistTab ===== */
// const WishlistTab = ({ wishlist }) => (
//   <div className="wishlist-tab">
//     <h3>Wishlist</h3>
//     {/* {wishlist.length > 0 ? (
//       <div className="wishlist-items">
//         {wishlist.map((item) => (
//           <div className="wishlist-card" key={item.id}>
//             <img src={item.image} alt={item.name} />
//             <div>{item.name}</div>
//             <div>Price: ₹{item.price.toFixed(2)}</div>
//             <div style={{ marginTop: "6px" }}>
//               <button onClick={() => alert(`Viewing ${item.name}`)}>View</button>
//               <button onClick={() => alert(`Removing ${item.name}`)}>Remove</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     ) : (
//       <p>Your wishlist is empty.</p>
//     )} */}
//     <WishlistPage />
//   </div>
// );
