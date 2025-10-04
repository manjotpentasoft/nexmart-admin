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

const StateChargePage = () => {
  const [stateCharges, setStateCharges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [formData, setFormData] = useState({
    state: "",
    price: "",
    status: "Enabled",
  });
  const [error, setError] = useState("");

  // Fetch state charges
  useEffect(() => {
    const fetchStateCharges = async () => {
      const querySnapshot = await getDocs(collection(db, "stateCharges"));
      const charges = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setStateCharges(charges);
    };

    fetchStateCharges();
  }, []);

  // Validation
  const validateForm = () => {
    if (!formData.state.trim()) return "State is required";
    if (!formData.price || formData.price <= 0)
      return "Price must be greater than 0";
    return "";
  };

  // Add state charge
  const handleAddCharge = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const docRef = await addDoc(collection(db, "stateCharges"), formData);
    setStateCharges([...stateCharges, { id: docRef.id, ...formData }]);
    setShowModal(false);
    resetForm();
  };

  // Update state charge
  const handleEditCharge = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const chargeRef = doc(db, "stateCharges", editingCharge.id);
    await updateDoc(chargeRef, formData);
    setStateCharges(
      stateCharges.map((c) =>
        c.id === editingCharge.id ? { ...c, ...formData } : c
      )
    );
    setShowModal(false);
    resetForm();
  };

  // Delete charge
  const handleDeleteCharge = async (id) => {
    await deleteDoc(doc(db, "stateCharges", id));
    setStateCharges(stateCharges.filter((c) => c.id !== id));
  };

  // Open Add modal
  const openAddModal = () => {
    resetForm();
    setEditingCharge(null);
    setError("");
    setShowModal(true);
  };

  // Open Edit modal
  const openEditModal = (charge) => {
    setEditingCharge(charge);
    setFormData({
      state: charge.state,
      price: charge.price,
      status: charge.status,
    });
    setError("");
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      state: "",
      price: "",
      status: "Enabled",
    });
  };

  const filteredCharges = stateCharges.filter((charge) =>
    charge.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>State Charge</h1>
          <p>Manage state charges for different regions</p>
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
              <th>State</th>
              <th>Price (%)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCharges.map((charge) => (
              <tr key={charge.id}>
                <td>{charge.state}</td>
                <td>{charge.price}%</td>
                <td>
                  <span
                    className={`order-status-badge ${
                      charge.status === "Enabled" ? "delivered" : "canceled"
                    }`}
                  >
                    {charge.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="edit" onClick={() => openEditModal(charge)}>
                    <FaEdit />
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDeleteCharge(charge.id)}
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
            <h2>{editingCharge ? "Edit State Charge" : "Add State Charge"}</h2>

            {error && <p className="error-message">{error}</p>}

            <input
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Price (%)"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="" disabled>Select Status</option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={editingCharge ? handleEditCharge : handleAddCharge}
              >
                {editingCharge ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StateChargePage;
