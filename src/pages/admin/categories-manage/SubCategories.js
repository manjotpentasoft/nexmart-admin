import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
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
  const { isSidebarOpen } = useSidebar();

  // Fetch categories and subcategories from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRef = collection(db, "categories");
        const categoriesQuery = query(categoriesRef, orderBy("name"));
        const categoriesUnsubscribe = onSnapshot(
          categoriesQuery,
          (querySnapshot) => {
            const categoriesData = [];
            querySnapshot.forEach((doc) => {
              categoriesData.push({ id: doc.id, ...doc.data() });
            });
            setCategories(categoriesData);
          }
        );

        const fetchAllSubcategories = async () => {
          const allSubcategories = [];

          const categoriesSnapshot = await getDocs(categoriesRef);

          for (const categoryDoc of categoriesSnapshot.docs) {
            const categoryData = categoryDoc.data();
            const subcategoriesRef = collection(
              db,
              "categories",
              categoryDoc.id,
              "subcategories"
            );
            const subcategoriesQuery = query(subcategoriesRef, orderBy("name"));
            const subcategoriesSnapshot = await getDocs(subcategoriesQuery);

            subcategoriesSnapshot.forEach((subDoc) => {
              allSubcategories.push({
                id: subDoc.id,
                ...subDoc.data(),
                categoryId: categoryDoc.id,
                categoryName: categoryData.name, // Explicitly add categoryName
              });
            });
          }

          setSubcategories(allSubcategories);
          setFilteredSubcategories(allSubcategories);
          setLoading(false);
        };

        fetchAllSubcategories();

        return () => {
          categoriesUnsubscribe();
        };
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter subcategories based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubcategories(subcategories);
    } else {
      const term = searchTerm.trim().toLowerCase();
      const filtered = subcategories.filter(
        (subcategory) =>
          subcategory.name.toLowerCase().includes(term) ||
          (subcategory.categoryName &&
            subcategory.categoryName.toLowerCase().includes(term))
      );
      setFilteredSubcategories(filtered);
    }
  }, [searchTerm, subcategories]);

  const addSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategory) return;

    try {
      // Find the selected category to get its name
      const category = categories.find((cat) => cat.id === selectedCategory);

      const subcategoriesRef = collection(
        db,
        "categories",
        selectedCategory,
        "subcategories"
      );
      await addDoc(subcategoriesRef, {
        name: newSubcategoryName,
        categoryId: selectedCategory,
        categoryName: category ? category.name : "",
        status: newSubcategoryStatus,
        image: subcategoryImagePreview || "",
        createdAt: new Date(),
        updatedAt: new Date(),
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

  const editSubcategory = async () => {
    if (!newSubcategoryName.trim() || !editingSubcategory) return;

    try {
      const subcategoryRef = doc(
        db,
        "categories",
        editingSubcategory.categoryId,
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
          doc(
            db,
            "categories",
            subcategory.categoryId,
            "subcategories",
            subcategory.id
          )
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
        subcategory.categoryId,
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
              <h1>Sub Categories</h1>
              <p>Manage subcategories here.</p>
            </div>
          </div>
          <div className="categories-table-section">
            <p>Loading subcategories...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AdminLayout>
        <div className="categories-header">
          <div>
            <h1>Sub Categories</h1>
            <p>Manage subcategories here.</p>
          </div>
        </div>

        <div className="categories-controls">
          <div className="search-container">
            <FaSearch className="search-icon" />
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
            Add Sub Category
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
                          className={`status ${
                            subcategory.status || "enabled"
                          }`}
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
                              setSubcategoryImagePreview(
                                subcategory.image || ""
                              );
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
            <div className="no-results">
              <p>No subcategories found.</p>
            </div>
          )}

          <div className="table-footer">
            <span>
              Showing 1 to{" "}
              {Math.min(entriesToShow, filteredSubcategories.length)} of{" "}
              {filteredSubcategories.length} entries
            </span>
          </div>
        </div>

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
                disabled={!newSubcategoryName.trim() || !selectedCategory}
              >
                Add Sub Category
              </button>
            </div>
          </div>
        </div>
      )}

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
      )}
    </AdminLayout>
  );
}
