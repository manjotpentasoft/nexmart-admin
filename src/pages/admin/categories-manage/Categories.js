import React, { useState, useEffect } from "react";
import { FaAngleDown, FaAngleUp, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import AdminLayout from "../../../components/AdminLayout";
import "./CategoriesPage.css";
import {
  subscribeToCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  subscribeToSubcategories,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryStatus,
} from "../../../firebase/categoriesService";
import { fileToBase64 } from "../../../firebase/firestoreService";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryStatus, setNewCategoryStatus] = useState("enabled");
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [entriesToShow, setEntriesToShow] = useState(10);

  // Load categories in real-time
  useEffect(() => {
    const unsubscribe = subscribeToCategories((data) => {
      setCategories(data);
      setFilteredCategories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const term = searchTerm.trim().toLowerCase();
      setFilteredCategories(
        categories.filter((c) => c.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, categories]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await addCategory({
        name: newCategoryName,
        status: newCategoryStatus,
        image: categoryImage || "",
      });
      setNewCategoryName("");
      setNewCategoryStatus("enabled");
      setCategoryImage("");
      setCategoryImagePreview("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    try {
      await updateCategory(editingCategory.id, {
        name: newCategoryName,
        status: newCategoryStatus,
        image: categoryImage || editingCategory.image || "",
      });
      setEditingCategory(null);
      setNewCategoryName("");
      setNewCategoryStatus("enabled");
      setCategoryImage("");
      setCategoryImagePreview("");
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All subcategories will also be deleted."
      )
    ) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const toggleStatus = async (category) => {
    try {
      await toggleCategoryStatus(category);
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setCategoryImage(base64);
      setCategoryImagePreview(base64);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="categories-header">
          <h1>Categories</h1>
          <p>Manage categories and subcategories here.</p>
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
          <h1>Categories</h1>
          <p>Manage categories and subcategories here.</p>
        </div>
        <div className="categories-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-category-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus style={{ marginRight: "8px" }} />
            Add Category
          </button>
        </div>
      </div>

      <div className="categories-table-section">
        {filteredCategories.length ? (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.slice(0, entriesToShow).map((category) => (
                <React.Fragment key={category.id}>
                  <tr>
                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="category-icon"
                        />
                      ) : (
                        <div className="category-icon">{category.name.charAt(0)}</div>
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td>
                      <span
                        className={`status ${category.status}`}
                        onClick={() => toggleStatus(category)}
                        style={{ cursor: "pointer" }}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          setEditingCategory(category);
                          setNewCategoryName(category.name);
                          setNewCategoryStatus(category.status || "enabled");
                          setCategoryImagePreview(category.image || "");
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="action-btn expand"
                        onClick={() => toggleExpand(category.id)}
                      >
                        {expandedIds.includes(category.id) ? <FaAngleUp /> : <FaAngleDown />}
                      </button>
                    </td>
                  </tr>
                  {expandedIds.includes(category.id) && (
                    <tr className="subcategory-section">
                      <td colSpan="4">
                        <SubcategoriesList
                          categoryId={category.id}
                          categoryName={category.name}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No categories found.</p>
        )}
      </div>

      {showAddModal && (
        <Modal
          title="Add New Category"
          name={newCategoryName}
          setName={setNewCategoryName}
          status={newCategoryStatus}
          setStatus={setNewCategoryStatus}
          imagePreview={categoryImagePreview}
          onImageChange={handleImageChange}
          onSubmit={handleAddCategory}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && (
        <Modal
          title="Edit Category"
          name={newCategoryName}
          setName={setNewCategoryName}
          status={newCategoryStatus}
          setStatus={setNewCategoryStatus}
          imagePreview={categoryImagePreview}
          onImageChange={handleImageChange}
          onSubmit={handleEditCategory}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </AdminLayout>
  );
}

// Modal component remains the same
function Modal({ title, name, setName, status, setStatus, imagePreview, onImageChange, onSubmit, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div className="form-group">
          <label>Image:</label>
          <input type="file" accept="image/*" onChange={onImageChange} />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onSubmit} disabled={!name.trim()}>
            {title.includes("Add") ? "Add" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubcategoriesList({ categoryId, categoryName }) {
  const [subcategories, setSubcategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryStatus, setNewSubcategoryStatus] = useState("enabled");
  const [subcategoryImagePreview, setSubcategoryImagePreview] = useState("");

  // Load subcategories in real-time
  useEffect(() => {
    const unsubscribe = subscribeToSubcategories(categoryId, (data) => {
      setSubcategories(data);
    });
    return () => unsubscribe();
  }, [categoryId]);

  const handleAdd = async () => {
    if (!newSubcategoryName.trim()) return;
    await addSubcategory(categoryId, {
      name: newSubcategoryName,
      status: newSubcategoryStatus,
      image: subcategoryImagePreview || "",
    });
    setNewSubcategoryName("");
    setNewSubcategoryStatus("enabled");
    setSubcategoryImagePreview("");
    setShowAddModal(false);
  };

  const handleEdit = async () => {
    if (!editingSubcategory || !newSubcategoryName.trim()) return;
    await updateSubcategory(categoryId, editingSubcategory.id, {
      name: newSubcategoryName,
      status: newSubcategoryStatus,
      image: subcategoryImagePreview || editingSubcategory.image || "",
    });
    setEditingSubcategory(null);
    setNewSubcategoryName("");
    setNewSubcategoryStatus("enabled");
    setSubcategoryImagePreview("");
    setShowEditModal(false);
  };

  const handleDelete = async (subcategory) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      await deleteSubcategory(categoryId, subcategory.id);
    }
  };

  const toggleStatus = async (subcategory) => {
    await toggleSubcategoryStatus(categoryId, subcategory);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setSubcategoryImagePreview(base64);
    }
  };

  return (
    <>
      <div className="subcategory-header">
        <h4>Subcategories for {categoryName}</h4>
        <button className="add-subcategory-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus style={{ marginRight: "8px" }} />
          Add Subcategory
        </button>
      </div>
      {subcategories.length ? (
        <table className="categories-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((sub) => (
              <tr key={sub.id}>
                <td>
                  {sub.image ? (
                    <img src={sub.image} alt={sub.name} className="category-icon" />
                  ) : (
                    <div className="category-icon">{sub.name.charAt(0)}</div>
                  )}
                </td>
                <td>{sub.name}</td>
                <td>
                  <span
                    className={`status ${sub.status || "enabled"}`}
                    onClick={() => toggleStatus(sub)}
                    style={{ cursor: "pointer" }}
                  >
                    {sub.status || "enabled"}
                  </span>
                </td>
                <td>
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setEditingSubcategory(sub);
                      setNewSubcategoryName(sub.name);
                      setNewSubcategoryStatus(sub.status || "enabled");
                      setSubcategoryImagePreview(sub.image || "");
                      setShowEditModal(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(sub)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No subcategories found. Click "Add Subcategory" to create one.</p>
      )}

      {showAddModal && (
        <Modal
          title="Add New Subcategory"
          name={newSubcategoryName}
          setName={setNewSubcategoryName}
          status={newSubcategoryStatus}
          setStatus={setNewSubcategoryStatus}
          imagePreview={subcategoryImagePreview}
          onImageChange={handleImageChange}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showEditModal && (
        <Modal
          title="Edit Subcategory"
          name={newSubcategoryName}
          setName={setNewSubcategoryName}
          status={newSubcategoryStatus}
          setStatus={setNewSubcategoryStatus}
          imagePreview={subcategoryImagePreview}
          onImageChange={handleImageChange}
          onSubmit={handleEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

export default CategoriesPage;
