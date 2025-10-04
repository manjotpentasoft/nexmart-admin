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
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

const TaxPage = () => {
  const [taxOptions, setTaxOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    tax: "",
    status: "",
  });
  const [error, setError] = useState("");

  // Fetch taxes with pagination
  const fetchTaxes = async (nextPage = false) => {
    let q = query(collection(db, "taxes"), orderBy("title"), limit(5));

    if (nextPage && lastDoc) {
      q = query(
        collection(db, "taxes"),
        orderBy("title"),
        startAfter(lastDoc),
        limit(5)
      );
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setHasMore(false);
      return;
    }

    const taxesData = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (nextPage) {
      setTaxOptions((prev) => [...prev, ...taxesData]);
    } else {
      setTaxOptions(taxesData);
    }

    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (formData.tax === "" || formData.tax < 0)
      return "Tax must be 0 or greater";
    if (!formData.status) return "Status is required";
    return "";
  };

  const handleAddTax = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const docRef = await addDoc(collection(db, "taxes"), formData);
    setTaxOptions([...taxOptions, { id: docRef.id, ...formData }]);
    setShowModal(false);
    resetForm();
  };

  const handleEditTax = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const taxRef = doc(db, "taxes", editingTax.id);
    await updateDoc(taxRef, formData);
    setTaxOptions(
      taxOptions.map((t) =>
        t.id === editingTax.id ? { ...t, ...formData } : t
      )
    );
    setShowModal(false);
    resetForm();
  };

  const handleDeleteTax = async (id) => {
    await deleteDoc(doc(db, "taxes", id));
    setTaxOptions(taxOptions.filter((t) => t.id !== id));
  };

  const openAddModal = () => {
    resetForm();
    setEditingTax(null);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (tax) => {
    setEditingTax(tax);
    setFormData({
      title: tax.title,
      tax: tax.tax,
      status: tax.status,
    });
    setError("");
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      tax: "",
      status: "",
    });
  };

  const filteredTaxes = taxOptions.filter((option) =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>Tax</h1>
          <p>Manage your tax options here</p>
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
              <th>Tax (%)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTaxes.map((option) => (
              <tr key={option.id}>
                <td>{option.title}</td>
                <td>{option.tax}%</td>
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
                    onClick={() => handleDeleteTax(option.id)}
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
          {hasMore && (
            <button onClick={() => fetchTaxes(true)}>Next</button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTax ? "Edit Tax Option" : "Add Tax Option"}</h2>

            {error && <p className="error-message">{error}</p>}

            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Tax (%)"
              value={formData.tax}
              onChange={(e) =>
                setFormData({ ...formData, tax: e.target.value })
              }
            />
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={editingTax ? handleEditTax : handleAddTax}>
                {editingTax ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TaxPage;
