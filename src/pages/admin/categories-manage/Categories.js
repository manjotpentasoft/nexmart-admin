import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import {
  FaAngleDown,
  FaAngleUp,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { useSidebar } from "../../../contexts/SidebarContext";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import "./CategoriesPage.css";
import AdminLayout from "../../../components/AdminLayout";

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
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const q = query(categoriesRef, orderBy("name"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const categoriesData = [];
          querySnapshot.forEach((doc) => {
            categoriesData.push({ id: doc.id, ...doc.data() });
          });
          setCategories(categoriesData);
          setFilteredCategories(categoriesData);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching categories: ", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const term = searchTerm.trim().toLowerCase();
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(term)
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const categoriesRef = collection(db, "categories");
      await addDoc(categoriesRef, {
        name: newCategoryName,
        status: newCategoryStatus,
        image: categoryImage || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewCategoryName("");
      setNewCategoryStatus("enabled");
      setCategoryImage("");
      setCategoryImagePreview("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding category: ", error);
    }
  };

  const editCategory = async () => {
    if (!newCategoryName.trim() || !editingCategory) return;

    try {
      const categoryRef = doc(db, "categories", editingCategory.id);
      await updateDoc(categoryRef, {
        name: newCategoryName,
        status: newCategoryStatus,
        image: categoryImage || editingCategory.image || "",
        updatedAt: new Date(),
      });

      setNewCategoryName("");
      setNewCategoryStatus("enabled");
      setCategoryImage("");
      setCategoryImagePreview("");
      setEditingCategory(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating category: ", error);
    }
  };

  const deleteCategory = async (category) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All subcategories will also be deleted."
      )
    ) {
      try {
        const subcategoriesRef = collection(
          db,
          "categories",
          category.id,
          "subcategories"
        );
        const subcategoriesSnapshot = await getDocs(subcategoriesRef);

        for (const subDoc of subcategoriesSnapshot.docs) {
          await deleteDoc(
            doc(db, "categories", category.id, "subcategories", subDoc.id)
          );
        }

        await deleteDoc(doc(db, "categories", category.id));
      } catch (error) {
        console.error("Error deleting category: ", error);
      }
    }
  };

  const toggleStatus = async (category) => {
    try {
      const categoryRef = doc(db, "categories", category.id);
      await updateDoc(categoryRef, {
        status: category.status === "enabled" ? "disabled" : "enabled",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error toggling category status: ", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setCategoryImage(imageUrl);
        setCategoryImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-layout">
        <AdminSidebar />
        <main
          className={`admin-dashboard-main ${
            !isSidebarOpen ? "sidebar-closed" : ""
          }`}
        >
          <div className="categories-header">
            <div>
              <h1>Categories</h1>
              <p>Manage categories and subcategories here.</p>
            </div>
          </div>
          <div className="categories-table-section">
            <p>Loading categories...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AdminLayout>
        <div className="categories-header">
          <div>
            <h1>Categories</h1>
            <p>Manage categories and subcategories here.</p>
          </div>
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
          <button
            className="add-category-btn"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus style={{ marginRight: "8px" }} />
            Add Category
          </button>
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

          {filteredCategories.length > 0 ? (
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
                        <div
                          className="category-icon"
                          style={{
                            backgroundColor: "none",
                          }}
                        >
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            category.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="category-info">
                          <h3>{category.name}</h3>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status ${category.status || "enabled"}`}
                          onClick={() => toggleStatus(category)}
                          style={{ cursor: "pointer" }}
                        >
                          {category.status || "enabled"} ▼
                        </span>
                      </td>
                      <td>
                        <div className="category-actions">
                          <button
                            className="action-btn edit"
                            onClick={() => {
                              setEditingCategory(category);
                              setNewCategoryName(category.name);
                              setNewCategoryStatus(
                                category.status || "enabled"
                              );
                              setCategoryImagePreview(category.image || "");
                              setShowEditModal(true);
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => deleteCategory(category)}
                          >
                            <FaTrash />
                          </button>
                          <button
                            className="action-btn expand"
                            onClick={() => toggleExpand(category.id)}
                          >
                            {expandedIds.includes(category.id) ? (
                              <FaAngleUp />
                            ) : (
                              <FaAngleDown />
                            )}
                          </button>
                        </div>
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
            <div className="no-results">
              <p>No categories found.</p>
            </div>
          )}
        </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Category</h3>
            <div className="form-group">
              <label>Category Name:</label>
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={newCategoryStatus}
                onChange={(e) => setNewCategoryStatus(e.target.value)}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {categoryImagePreview && (
                <div className="image-preview">
                  <img src={categoryImagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button onClick={addCategory} disabled={!newCategoryName.trim()}>
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Category</h3>
            <div className="form-group">
              <label>Category Name:</label>
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={newCategoryStatus}
                onChange={(e) => setNewCategoryStatus(e.target.value)}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {categoryImagePreview && (
                <div className="image-preview">
                  <img src={categoryImagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={editCategory} disabled={!newCategoryName.trim()}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      </AdminLayout>
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

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subcategoriesRef = collection(
          db,
          "categories",
          categoryId,
          "subcategories"
        );
        const q = query(subcategoriesRef, orderBy("name"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const subcategoriesData = [];
          querySnapshot.forEach((doc) => {
            subcategoriesData.push({ id: doc.id, ...doc.data() });
          });
          setSubcategories(subcategoriesData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching subcategories: ", error);
      }
    };

    fetchSubcategories();
  }, [categoryId]);

  const addSubcategory = async () => {
    if (!newSubcategoryName.trim()) return;

    try {
      const subcategoriesRef = collection(
        db,
        "categories",
        categoryId,
        "subcategories"
      );
      await addDoc(subcategoriesRef, {
        name: newSubcategoryName,
        status: newSubcategoryStatus,
        image: subcategoryImagePreview || "",
        categoryId: categoryId,
        categoryName: categoryName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewSubcategoryName("");
      setNewSubcategoryStatus("enabled");
      setSubcategoryImagePreview("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding subcategory: ", error);
    }
  };

  const editSubcategory = async () => {
    if (!newSubcategoryName.trim() || !editingSubcategory) return;

    try {
      const subcategoryRef = doc(
        db,
        "categories",
        categoryId,
        "subcategories",
        editingSubcategory.id
      );
      await updateDoc(subcategoryRef, {
        name: newSubcategoryName,
        status: newSubcategoryStatus,
        image: subcategoryImagePreview || editingSubcategory.image || "",
        updatedAt: new Date(),
      });

      setNewSubcategoryName("");
      setNewSubcategoryStatus("enabled");
      setSubcategoryImagePreview("");
      setEditingSubcategory(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating subcategory: ", error);
    }
  };

  const deleteSubcategory = async (subcategory) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await deleteDoc(
          doc(db, "categories", categoryId, "subcategories", subcategory.id)
        );
      } catch (error) {
        console.error("Error deleting subcategory: ", error);
      }
    }
  };

  const toggleStatus = async (subcategory) => {
    try {
      const subcategoryRef = doc(
        db,
        "categories",
        categoryId,
        "subcategories",
        subcategory.id
      );
      await updateDoc(subcategoryRef, {
        status: subcategory.status === "enabled" ? "disabled" : "enabled",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error toggling subcategory status: ", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubcategoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="subcategory-header">
        <h4>Subcategories for {categoryName}</h4>
        <button
          className="add-subcategory-btn"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus style={{ marginRight: "8px" }} />
          Add Subcategory
        </button>
      </div>
      <div className="subcategory-list">
        {subcategories.length > 0 ? (
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
              {subcategories.map((subcategory) => (
                <tr key={subcategory.id}>
                  <td>
                    <div
                      className="category-icon"
                      style={{ backgroundColor: "none" }}
                    >
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
                        onClick={() => deleteSubcategory(subcategory)}
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
          <div className="no-subcategories">
            No subcategories found. Click "Add Subcategory" to create one.
          </div>
        )}
      </div>
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Subcategory</h3>
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {subcategoryImagePreview && (
                <div className="image-preview">
                  <img src={subcategoryImagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                onClick={addSubcategory}
                disabled={!newSubcategoryName.trim()}
              >
                Add Subcategory
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Subcategory</h3>
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {subcategoryImagePreview && (
                <div className="image-preview">
                  <img src={subcategoryImagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button
                onClick={editSubcategory}
                disabled={!newSubcategoryName.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}{" "}
    </>
  );
}

export default CategoriesPage;
