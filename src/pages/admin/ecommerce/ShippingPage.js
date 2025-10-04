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


const ShippingPage = () => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    status: "Enabled",
  });
  const [error, setError] = useState("");

  // Fetch shipping options
  useEffect(() => {
    const fetchShipping = async () => {
      const querySnapshot = await getDocs(collection(db, "shipping"));
      const shippingData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setShippingOptions(shippingData);
    };

    fetchShipping();
  }, []);

  // Validation
  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.price || formData.price <= 0) return "Price must be greater than 0";
    return "";
  };

  // Add shipping option
  const handleAddOption = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const docRef = await addDoc(collection(db, "shipping"), formData);
    setShippingOptions([...shippingOptions, { id: docRef.id, ...formData }]);
    setShowModal(false);
    resetForm();
  };

  // Update shipping option
  const handleEditOption = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const optionRef = doc(db, "shipping", editingOption.id);
    await updateDoc(optionRef, formData);
    setShippingOptions(
      shippingOptions.map((s) =>
        s.id === editingOption.id ? { ...s, ...formData } : s
      )
    );
    setShowModal(false);
    resetForm();
  };

  // Delete option
  const handleDeleteOption = async (id) => {
    await deleteDoc(doc(db, "shipping", id));
    setShippingOptions(shippingOptions.filter((s) => s.id !== id));
  };

  // Open Add modal
  const openAddModal = () => {
    resetForm();
    setEditingOption(null);
    setError("");
    setShowModal(true);
  };

  // Open Edit modal
  const openEditModal = (option) => {
    setEditingOption(option);
    setFormData({
      title: option.title,
      price: option.price,
      status: option.status,
    });
    setError("");
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      status: "Enabled",
    });
  };

  const filteredShipping = shippingOptions.filter((option) =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>Shipping</h1>
          <p>Manage your shipping methods here</p>
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
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShipping.map((option) => (
              <tr key={option.id}>
                <td>{option.title}</td>
                <td>{option.price}</td>
                <td>
                  <span
                    className={`order-status-badge ${
                      option.status === "Enabled" ? "delivered" : "canceled"
                    }`}
                  >
                    {option.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="edit" onClick={() => openEditModal(option)}>
                    <FaEdit />
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDeleteOption(option.id)}
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
            <h2>{editingOption ? "Edit Shipping Option" : "Add Shipping Option"}</h2>

            {error && <p className="error-message">{error}</p>}

            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              <button onClick={editingOption ? handleEditOption : handleAddOption}>
                {editingOption ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ShippingPage;
