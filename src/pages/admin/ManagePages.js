import React, { useState } from "react";
import "../../styles/ManagePages.css";
import AdminLayout from "../../components/AdminLayout";
import { FaEdit, FaTrash } from "react-icons/fa";

const ManagePages = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: "How It Works",
      slug: "how-it-works",
      details: "",
      keywords: "",
      description: "",
      displayOn: "Both",
    },
    {
      id: 2,
      title: "Return Policy",
      slug: "return-policy",
      details: "",
      keywords: "",
      description: "",
      displayOn: "Both",
    },
    {
      id: 3,
      title: "Terms & Service",
      slug: "terms-service",
      details: "",
      keywords: "",
      description: "",
      displayOn: "Both",
    },
    {
      id: 4,
      title: "Privacy Policy",
      slug: "privacy-policy",
      details: "",
      keywords: "",
      description: "",
      displayOn: "Both",
    },
    {
      id: 5,
      title: "About Us",
      slug: "about-us",
      details: "",
      keywords: "",
      description: "",
      displayOn: "Both",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    details: "",
    keywords: "",
    description: "",
  });

  const openAddModal = () => {
    setFormData({
      title: "",
      slug: "",
      details: "",
      keywords: "",
      description: "",
    });
    setEditingPage(null);
    setModalOpen(true);
  };

  const openEditModal = (page) => {
    setFormData(page);
    setEditingPage(page.id);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingPage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPage) {
      setPages(
        pages.map((p) => (p.id === editingPage ? { ...p, ...formData } : p))
      );
    } else {
      setPages([...pages, { id: Date.now(), ...formData, displayOn: "Both" }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setPages(pages.filter((p) => p.id !== id));
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="orders-header">
        <div className="orders-title">
          <h1>Manage Pages</h1>
          <p>Control static pages displayed on your website</p>
        </div>
        <button className="filter-btn" onClick={openAddModal}>
          + Add
        </button>
      </div>

      {/* Table */}
      <div className="orders-table-section">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Display On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td>{page.slug}</td>
                <td>
                  <select className="status-dropdown" value={page.displayOn}>
                    <option value="Both">Both</option>
                    <option value="App">App</option>
                    <option value="Website">Website</option>
                  </select>
                </td>
                <td className="actions">
                  <button className="edit" onClick={() => openEditModal(page)}>
                    <FaEdit />
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(page.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
{/* 
        Pagination
        <div className="pagination">
          <button className="active">1</button>
        </div> */}
      </div> 

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingPage ? "Edit Page" : "Add Page"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Title"
                required
              />

              <label>Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="Enter Slug"
                required
              />

              <label>Details *</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Enter Details"
                rows="4"
                required
              />

              <label>Meta Keywords</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="Enter Meta Keywords"
              />

              <label>Meta Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Meta Description"
                rows="3"
              />

              <div className="modal-buttons">
                <button type="submit">
                  {editingPage ? "Update" : "Submit"}
                </button>
                <button type="button" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManagePages;
