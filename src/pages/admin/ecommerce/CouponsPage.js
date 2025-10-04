import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "./CouponsPage.css";
import AdminLayout from "../../../components/AdminLayout";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    times: "",
    discount: "",
    status: "Enabled",
  });
  const [error, setError] = useState("");

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      const querySnapshot = await getDocs(collection(db, "coupons"));
      const couponsData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setCoupons(couponsData);
    };

    fetchCoupons();
  }, []);

  // Validation
  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.code.trim()) return "Code is required";
    if (!formData.times || formData.times <= 0) return "Times must be greater than 0";
    if (!formData.discount.trim()) return "Discount is required";
    return "";
  };

  // Add coupon
  const handleAddCoupon = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const docRef = await addDoc(collection(db, "coupons"), formData);
    setCoupons([...coupons, { id: docRef.id, ...formData }]);
    setShowModal(false);
    resetForm();
  };

  // Update coupon
  const handleEditCoupon = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const couponRef = doc(db, "coupons", editingCoupon.id);
    await updateDoc(couponRef, formData);
    setCoupons(
      coupons.map((c) =>
        c.id === editingCoupon.id ? { ...c, ...formData } : c
      )
    );
    setShowModal(false);
    resetForm();
  };

  // Delete coupon
  const handleDeleteCoupon = async (id) => {
    await deleteDoc(doc(db, "coupons", id));
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  // Open Add modal
  const openAddModal = () => {
    resetForm();
    setError("");
    setEditingCoupon(null);
    setShowModal(true);
  };

  // Open Edit modal
  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      title: coupon.title,
      code: coupon.code,
      times: coupon.times,
      discount: coupon.discount,
      status: coupon.status,
    });
    setError("");
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      code: "",
      times: "",
      discount: "",
      status: "Enabled",
    });
    setError("");
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>Coupons</h1>
          <p>Manage your discount coupons here</p>
        </div>
        <div className="search-area">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="filter-btn" onClick={openAddModal}>
            <FaPlus /> Add
          </button>
        </div>
      </div>

      <div className="orders-table-section">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Code</th>
              <th>No. Of Times</th>
              <th>Discount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.title}</td>
                <td>{coupon.code}</td>
                <td>{coupon.times}</td>
                <td>{coupon.discount}</td>
                <td>
                  <span
                    className={`order-status-badge ${
                      coupon.status === "Enabled" ? "delivered" : "canceled"
                    }`}
                  >
                    {coupon.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="edit" onClick={() => openEditModal(coupon)}>
                    <FaEdit />
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button className="active">1</button>
          <button>Next</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h2>

            {error && <p className="error-message">{error}</p>}

            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <input
              type="number"
              placeholder="No. of Times"
              value={formData.times}
              onChange={(e) => setFormData({ ...formData, times: e.target.value })}
            />
            <input
              type="text"
              placeholder="Discount"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="" disabled>Select Status</option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={editingCoupon ? handleEditCoupon : handleAddCoupon}
              >
                {editingCoupon ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CouponsPage;
