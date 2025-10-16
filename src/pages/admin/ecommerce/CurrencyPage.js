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

const CurrencyPage = () => {
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sign: "",
    value: "",
    status: "Enabled",
    isDefault: false,
  });
  const [error, setError] = useState("");

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      const querySnapshot = await getDocs(collection(db, "currencies"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setCurrencies(data);
    };

    fetchCurrencies();
  }, []);

  // Validation
  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.sign.trim()) return "Sign is required";
    if (formData.value === "" || formData.value <= 0)
      return "Value must be greater than 0";
    return "";
  };

  // Add currency
  const handleAddCurrency = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const docRef = await addDoc(collection(db, "currencies"), formData);
    setCurrencies([...currencies, { id: docRef.id, ...formData }]);
    setShowModal(false);
    resetForm();
  };

  // Edit currency
  const handleEditCurrency = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const ref = doc(db, "currencies", editingCurrency.id);
    await updateDoc(ref, formData);
    setCurrencies(
      currencies.map((c) =>
        c.id === editingCurrency.id ? { ...c, ...formData } : c
      )
    );
    setShowModal(false);
    resetForm();
  };

  // Delete currency
  const handleDeleteCurrency = async (id) => {
    await deleteDoc(doc(db, "currencies", id));
    setCurrencies(currencies.filter((c) => c.id !== id));
  };

  // Set default currency (only one allowed)
  const handleSetDefault = async (currency) => {
    const updatedCurrencies = currencies.map((c) => ({
      ...c,
      isDefault: c.id === currency.id,
    }));

    // Update Firestore for all currencies
    for (const c of updatedCurrencies) {
      const ref = doc(db, "currencies", c.id);
      await updateDoc(ref, { isDefault: c.isDefault });
    }

    setCurrencies(updatedCurrencies);
  };

  // Toggle enable/disable
  // const handleToggleStatus = async (currency, newStatus) => {
  //   const ref = doc(db, "currencies", currency.id);
  //   await updateDoc(ref, { status: newStatus });
  //   setCurrencies(
  //     currencies.map((c) =>
  //       c.id === currency.id ? { ...c, status: newStatus } : c
  //     )
  //   );
  // };

  // Open Add Modal
  const openAddModal = () => {
    resetForm();
    setEditingCurrency(null);
    setError("");
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (currency) => {
    setEditingCurrency(currency);
    setFormData(currency);
    setError("");
    setShowModal(true);
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: "",
      sign: "",
      value: "",
      status: "Enabled",
      isDefault: false,
    });
  };

  const filteredCurrencies = currencies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>Currency</h1>
          <p>Manage currency options here</p>
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
              <th>Name</th>
              <th>Sign</th>
              <th>Value</th>
              <th>Default</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCurrencies.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.sign}</td>
                <td>{c.value}</td>
                <td>
                  {c.isDefault ? (
                    <span className="order-status-badge delivered">
                      Default
                    </span>
                  ) : (
                    <button
                      className="filter-btn"
                      style={{ fontSize: "0.8rem" }}
                      onClick={() => handleSetDefault(c)}
                    >
                      Set Default
                    </button>
                  )}
                </td>
                <td className="actions">
                  <button className="edit" onClick={() => openEditModal(c)}>
                    <FaEdit />
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDeleteCurrency(c.id)}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingCurrency ? "Edit Currency" : "Add Currency"}</h2>

            {error && <p className="error-message">{error}</p>}

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Sign"
              value={formData.sign}
              onChange={(e) => setFormData({ ...formData, sign: e.target.value })}
            />
            <input
              type="number"
              placeholder="Value"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={editingCurrency ? handleEditCurrency : handleAddCurrency}
              >
                {editingCurrency ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CurrencyPage;
