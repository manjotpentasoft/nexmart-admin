import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import AdminLayout from "../../../components/AdminLayout";
import {
  subscribeToCategories,
  addNewSubcategory,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryStatus,
  subscribeToSubcategories,
} from "../../../firebase/categoriesService";
import { fileToBase64 } from "../../../firebase/firestoreService";
import "./CategoriesPage.css";

export default function SubCategoriesPage() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryStatus, setNewSubcategoryStatus] = useState("enabled");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategoryImagePreview, setSubcategoryImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [entriesToShow, setEntriesToShow] = useState(10);

  // Load categories in real-time
  useEffect(() => {
    const unsubscribe = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load subcategories whenever categories change
  useEffect(() => {
    const loadAllSubcategories = async () => {
      const allSubs = [];
      for (const category of categories) {
        if (category.id) {
          const unsubscribe = subscribeToSubcategories(
            `categories/${category.id}/subcategories`,
            (subs) => {
              subs.forEach((sub) => {
                const exists = allSubs.find((s) => s.id === sub.id);
                if (!exists) {
                  allSubs.push({ ...sub, categoryId: category.id, categoryName: category.name });
                }
              });
              setSubcategories([...allSubs]);
              setFilteredSubcategories([...allSubs]);
            }
          );
          // Cleanup on unmount
          return () => unsubscribe();
        }
      }
    };
    loadAllSubcategories();
  }, [categories]);

  // Filter subcategories based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSubcategories(subcategories);
    } else {
      const term = searchTerm.trim().toLowerCase();
      setFilteredSubcategories(
        subcategories.filter(
          (sub) =>
            sub.name.toLowerCase().includes(term) ||
            (sub.categoryName && sub.categoryName.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, subcategories]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setSubcategoryImagePreview(base64);
    }
  };

  const addNewSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategory) return;
    const category = categories.find((cat) => cat.id === selectedCategory);

    try {
      await addNewSubcategory(selectedCategory, {
        name: newSubcategoryName,
        status: newSubcategoryStatus,
        image: subcategoryImagePreview || "",
      });

      setNewSubcategoryName("");
      setSelectedCategory("");
      setNewSubcategoryStatus("enabled");
      setSubcategoryImagePreview("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding subcategory: ", error);
    }
  };

  const editExistingSubcategory = async () => {
    if (!newSubcategoryName.trim() || !editingSubcategory) return;

    try {
      await updateSubcategory(
        editingSubcategory.categoryId,
        editingSubcategory.id,
        {
          name: newSubcategoryName,
          status: newSubcategoryStatus,
          image: subcategoryImagePreview || editingSubcategory.image || "",
        }
      );

      setNewSubcategoryName("");
      setNewSubcategoryStatus("enabled");
      setSubcategoryImagePreview("");
      setEditingSubcategory(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating subcategory: ", error);
    }
  };

  const removeSubcategory = async (subcategory) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await deleteSubcategory(subcategory.categoryId, subcategory.id);
      } catch (error) {
        console.error("Error deleting subcategory: ", error);
      }
    }
  };

  const toggleStatus = async (subcategory) => {
    try {
      await toggleSubcategoryStatus(subcategory.categoryId, subcategory);
    } catch (error) {
      console.error("Error toggling status: ", error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="categories-header">
          <div>
            <h1>Sub Categories</h1>
            <p>Manage subcategories here.</p>
          </div>
        </div>
        <div className="categories-table-section">
          <div className="loader"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="categories-header">
        <div>
          <h1>Sub Categories</h1>
          <p>Manage subcategories here.</p>
        </div>
        <div className="categories-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="add-category-btn"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus style={{ marginRight: "8px" }} />
            Add
          </button>
        </div>
      </div>

      <div className="categories-table-section">
        <div className="table-info">
          <span>Show</span>
          <select
            value={entriesToShow}
            onChange={(e) => setEntriesToShow(parseInt(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries</span>
        </div>

        {filteredSubcategories.length > 0 ? (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubcategories
                .slice(0, entriesToShow)
                .map((subcategory) => (
                  <tr key={subcategory.id}>
                    <td>
                      <div className="category-icon">
                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          subcategory.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="category-info">
                        <h3>{subcategory.categoryName || "Uncategorized"}</h3>
                      </div>
                    </td>
                    <td>
                      <div className="category-info">
                        <h3>{subcategory.name}</h3>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status ${subcategory.status || "enabled"}`}
                        onClick={() => toggleStatus(subcategory)}
                        style={{ cursor: "pointer" }}
                      >
                        {subcategory.status || "enabled"} ▼
                      </span>
                    </td>
                    <td>
                      <div className="category-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            setEditingSubcategory(subcategory);
                            setNewSubcategoryName(subcategory.name);
                            setNewSubcategoryStatus(
                              subcategory.status || "enabled"
                            );
                            setSubcategoryImagePreview(subcategory.image || "");
                            setShowEditModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => removeSubcategory(subcategory)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <p>No subcategories found.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Sub Category</h3>
            <div className="form-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Subcategory Name:</label>
              <input
                type="text"
                placeholder="Subcategory name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={newSubcategoryStatus}
                onChange={(e) => setNewSubcategoryStatus(e.target.value)}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Image:</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {subcategoryImagePreview && (
                <div className="image-preview">
                  <img src={subcategoryImagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                onClick={addNewSubcategory}
                disabled={!newSubcategoryName.trim() || !selectedCategory}
              >
                Add Sub Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Sub Category</h3>
            <div className="form-group">
              <label>Subcategory Name:</label>
              <input
                type="text"
                placeholder="Subcategory name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={newSubcategoryStatus}
                onChange={(e) => setNewSubcategoryStatus(e.target.value)}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Image:</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {subcategoryImagePreview && (
                <div className="image-preview">
                  <img src={subcategoryImagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button
                onClick={editExistingSubcategory}
                disabled={!newSubcategoryName.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
