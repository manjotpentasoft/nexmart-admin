import React, { useMemo, useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { useCollection } from "../../../hooks/useCollection";
import { useModal } from "../../../hooks/useModal";
import { useImageUpload } from "../../../hooks/useImageUpload";
import CategoryModal from "../../../components/categories/CategoryModal";
import {
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
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import "./CategoriesPage.css";

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const categories = useCollection({ path: "categories" });
  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen, payload: editing, open, close } = useModal();
  const {
    preview,
    handleFile,
    clear: clearImage,
    setPreview,
  } = useImageUpload();
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    if (categories) {
      setLoading(false);
    }
  }, [categories]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.trim().toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [searchTerm, categories]);

  const openAdd = () => {
    setPreview("");
    open(null);
  };

  const openEdit = (cat) => {
    setPreview(cat.image || "");
    open(cat);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateCategory(editing.id, {
          name: payload.name,
          status: payload.status,
          image: preview || editing.image || "",
        });
      } else {
        await addCategory({
          name: payload.name,
          status: payload.status,
          image: preview || "",
        });
      }
      clearImage();
      close();
    } catch (err) {
      console.error("Save category failed:", err);
    }
  };

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category and its subcategories?"
      )
    )
      return;
    try {
      await deleteCategory(cat.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await toggleCategoryStatus(cat);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout>
      <div className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>Manage categories and subcategories here.</p>
        </div>

        <div className="categories-controls">
          <div className="categories-search-container">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-category-btn" onClick={openAdd}>
            <span style={{ marginRight: 8 }}>+</span> Add Category
          </button>
        </div>
      </div>

      <div className="categories-table-section">
        {loading ? (
          <div className="loader"></div>
        ) : filtered.length ? (
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
              {filtered.map((category) => (
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
                        <div className="category-icon">
                          {category.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td>
                      <span
                        className={`status ${category.status || "enabled"}`}
                        onClick={() => handleToggleStatus(category)}
                        style={{ cursor: "pointer" }}
                      >
                        {category.status || "enabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => openEdit(category)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(category)}
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
                    </td>
                  </tr>
                  {expandedIds.includes(category.id) && (
                    <tr className="subcategory-section">
                      <td colSpan="4">
                        <SubcategoriesInline category={category} />
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

      {isOpen && (
        <CategoryModal
          title={editing ? "Edit Category" : "Add New Category"}
          initial={editing || {}}
          imagePreview={preview}
          onImageChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await handleFile(file);
          }}
          onSubmit={handleSubmit}
          onClose={() => {
            clearImage();
            close();
          }}
        />
      )}
    </AdminLayout>
  );
}

function SubcategoriesInline({ category }) {
  const [subs, setSubs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("enabled");
  const { preview, handleFile, clear } = useImageUpload();

  useEffect(() => {
    if (!category?.id) return;
    const unsub = subscribeToSubcategories(category.id, (data) => {
      setSubs(Array.isArray(data) ? data : []);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [category?.id]);

  const openAdd = () => {
    setName("");
    setStatus("enabled");
    clear();
    setShowAdd(true);
  };

  const openEdit = (sub) => {
    setEditingSub(sub);
    setName(sub.name);
    setStatus(sub.status || "enabled");
    setShowEdit(true);
  };

  const doAdd = async ({ name, status }) => {
    if (!name.trim()) return;
    await addSubcategory(category.id, {
      name: name.trim(),
      status,
      image: preview || "",
    });
    setShowAdd(false);
    clear();
    setName("");
  };

  const doEdit = async ({ name, status }) => {
    if (!editingSub || !name.trim()) return;
    await updateSubcategory(category.id, editingSub.id, {
      name: name.trim(),
      status,
      image: preview || editingSub.image || "",
    });
    setShowEdit(false);
    setEditingSub(null);
    setName("");
    clear();
  };

  const doDelete = async (sub) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?"))
      return;
    await deleteSubcategory(category.id, sub.id);
  };

  const doToggle = async (sub) => {
    await toggleSubcategoryStatus(category.id, sub);
  };

  return (
    <>
      <div className="subcategory-header">
        <h4>Subcategories for {category.name}</h4>
        <button className="add-subcategory-btn" onClick={openAdd}>
          <FaPlus style={{ marginRight: 8 }} /> Add Subcategory
        </button>
      </div>

      {subs.length ? (
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
            {subs.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="category-icon" />
                  ) : (
                    <div className="category-icon">{s.name.charAt(0)}</div>
                  )}
                </td>
                <td>{s.name}</td>
                <td>
                  <span
                    className={`status ${s.status || "enabled"}`}
                    onClick={() => doToggle(s)}
                    style={{ cursor: "pointer" }}
                  >
                    {s.status || "enabled"}
                  </span>
                </td>
                <td>
                  <button
                    className="action-btn edit"
                    onClick={() => openEdit(s)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => doDelete(s)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-subcategories">
          No subcategories found. Click "Add Subcategory" to create one.
        </p>
      )}

      {/* Add Subcategory Modal */}
      {showAdd && (
        <CategoryModal
          title="Add New Subcategory"
          initial={{ name: "", status: "enabled" }}
          imagePreview={preview}
          onImageChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await handleFile(file);
          }}
          onSubmit={doAdd}
          onClose={() => {
            clear();
            setShowAdd(false);
          }}
        />
      )}

      {/* Edit Subcategory Modal */}
      {showEdit && (
        <CategoryModal
          title="Edit Subcategory"
          initial={editingSub || {}}
          imagePreview={preview || editingSub?.image || ""}
          onImageChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await handleFile(file);
          }}
          onSubmit={doEdit}
          onClose={() => {
            clear();
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}

// import React, { useState, useEffect } from "react";
// import { FaAngleDown, FaAngleUp, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
// import AdminLayout from "../../../components/AdminLayout";
// import "./CategoriesPage.css";
// import {
//   subscribeToCategories,
//   addCategory,
//   updateCategory,
//   deleteCategory,
//   toggleCategoryStatus,
//   subscribeToSubcategories,
//   addSubcategory,
//   updateSubcategory,
//   deleteSubcategory,
//   toggleSubcategoryStatus,
// } from "../../../firebase/categoriesService";
// import { fileToBase64 } from "../../../firebase/firestoreService";

// function CategoriesPage() {
//   const [categories, setCategories] = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expandedIds, setExpandedIds] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [newCategoryName, setNewCategoryName] = useState("");
//   const [newCategoryStatus, setNewCategoryStatus] = useState("enabled");
//   const [categoryImage, setCategoryImage] = useState(null);
//   const [categoryImagePreview, setCategoryImagePreview] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [entriesToShow, setEntriesToShow] = useState(10);

//   // Load categories in real-time
//   useEffect(() => {
//     const unsubscribe = subscribeToCategories((data) => {
//       setCategories(data);
//       setFilteredCategories(data);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Search filter
//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       setFilteredCategories(categories);
//     } else {
//       const term = searchTerm.trim().toLowerCase();
//       setFilteredCategories(
//         categories.filter((c) => c.name.toLowerCase().includes(term))
//       );
//     }
//   }, [searchTerm, categories]);

//   const toggleExpand = (id) => {
//     setExpandedIds((prev) =>
//       prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
//     );
//   };

//   const handleAddCategory = async () => {
//     if (!newCategoryName.trim()) return;
//     try {
//       await addCategory({
//         name: newCategoryName,
//         status: newCategoryStatus,
//         image: categoryImage || "",
//       });
//       setNewCategoryName("");
//       setNewCategoryStatus("enabled");
//       setCategoryImage("");
//       setCategoryImagePreview("");
//       setShowAddModal(false);
//     } catch (error) {
//       console.error("Error adding category:", error);
//     }
//   };

//   const handleEditCategory = async () => {
//     if (!editingCategory || !newCategoryName.trim()) return;
//     try {
//       await updateCategory(editingCategory.id, {
//         name: newCategoryName,
//         status: newCategoryStatus,
//         image: categoryImage || editingCategory.image || "",
//       });
//       setEditingCategory(null);
//       setNewCategoryName("");
//       setNewCategoryStatus("enabled");
//       setCategoryImage("");
//       setCategoryImagePreview("");
//       setShowEditModal(false);
//     } catch (error) {
//       console.error("Error updating category:", error);
//     }
//   };

//   const handleDeleteCategory = async (category) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this category? All subcategories will also be deleted."
//       )
//     ) {
//       try {
//         await deleteCategory(category.id);
//       } catch (error) {
//         console.error("Error deleting category:", error);
//       }
//     }
//   };

//   const toggleStatus = async (category) => {
//     try {
//       await toggleCategoryStatus(category);
//     } catch (error) {
//       console.error("Error toggling status:", error);
//     }
//   };

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const base64 = await fileToBase64(file);
//       setCategoryImage(base64);
//       setCategoryImagePreview(base64);
//     }
//   };

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="categories-header">
//           <h1>Categories</h1>
//           <p>Manage categories and subcategories here.</p>
//         </div>
//         <div className="categories-table-section">
//           <div className="loader"></div>
//         </div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       <div className="categories-header">
//         <div>
//           <h1>Categories</h1>
//           <p>Manage categories and subcategories here.</p>
//         </div>
//         <div className="categories-controls">
//           <div className="categories-search-container">
//             <input
//               type="text"
//               placeholder="Search categories..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <button className="add-category-btn" onClick={() => setShowAddModal(true)}>
//             <FaPlus style={{ marginRight: "8px" }} />
//             Add Category
//           </button>
//         </div>
//       </div>

//       <div className="categories-table-section">
//         {filteredCategories.length ? (
//           <table className="categories-table">
//             <thead>
//               <tr>
//                 <th>Image</th>
//                 <th>Name</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCategories.slice(0, entriesToShow).map((category) => (
//                 <React.Fragment key={category.id}>
//                   <tr>
//                     <td>
//                       {category.image ? (
//                         <img
//                           src={category.image}
//                           alt={category.name}
//                           className="category-icon"
//                         />
//                       ) : (
//                         <div className="category-icon">{category.name.charAt(0)}</div>
//                       )}
//                     </td>
//                     <td>{category.name}</td>
//                     <td>
//                       <span
//                         className={`status ${category.status}`}
//                         onClick={() => toggleStatus(category)}
//                         style={{ cursor: "pointer" }}
//                       >
//                         {category.status}
//                       </span>
//                     </td>
//                     <td>
//                       <button
//                         className="action-btn edit"
//                         onClick={() => {
//                           setEditingCategory(category);
//                           setNewCategoryName(category.name);
//                           setNewCategoryStatus(category.status || "enabled");
//                           setCategoryImagePreview(category.image || "");
//                           setShowEditModal(true);
//                         }}
//                       >
//                         <FaEdit />
//                       </button>
//                       <button
//                         className="action-btn delete"
//                         onClick={() => handleDeleteCategory(category)}
//                       >
//                         <FaTrash />
//                       </button>
//                       <button
//                         className="action-btn expand"
//                         onClick={() => toggleExpand(category.id)}
//                       >
//                         {expandedIds.includes(category.id) ? <FaAngleUp /> : <FaAngleDown />}
//                       </button>
//                     </td>
//                   </tr>
//                   {expandedIds.includes(category.id) && (
//                     <tr className="subcategory-section">
//                       <td colSpan="4">
//                         <SubcategoriesList
//                           categoryId={category.id}
//                           categoryName={category.name}
//                         />
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p>No categories found.</p>
//         )}
//       </div>

//       {showAddModal && (
//         <Modal
//           title="Add New Category"
//           name={newCategoryName}
//           setName={setNewCategoryName}
//           status={newCategoryStatus}
//           setStatus={setNewCategoryStatus}
//           imagePreview={categoryImagePreview}
//           onImageChange={handleImageChange}
//           onSubmit={handleAddCategory}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}

//       {showEditModal && (
//         <Modal
//           title="Edit Category"
//           name={newCategoryName}
//           setName={setNewCategoryName}
//           status={newCategoryStatus}
//           setStatus={setNewCategoryStatus}
//           imagePreview={categoryImagePreview}
//           onImageChange={handleImageChange}
//           onSubmit={handleEditCategory}
//           onClose={() => setShowEditModal(false)}
//         />
//       )}
//     </AdminLayout>
//   );
// }

// // Modal component remains the same
// function Modal({ title, name, setName, status, setStatus, imagePreview, onImageChange, onSubmit, onClose }) {
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" onClick={(e) => e.stopPropagation()}>
//         <h3>{title}</h3>
//         <div className="form-group">
//           <label>Name:</label>
//           <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
//         </div>
//         <div className="form-group">
//           <label>Status:</label>
//           <select value={status} onChange={(e) => setStatus(e.target.value)}>
//             <option value="enabled">Enabled</option>
//             <option value="disabled">Disabled</option>
//           </select>
//         </div>
//         <div className="form-group">
//           <label>Image:</label>
//           <input type="file" accept="image/*" onChange={onImageChange} />
//           {imagePreview && (
//             <div className="image-preview">
//               <img src={imagePreview} alt="Preview" />
//             </div>
//           )}
//         </div>
//         <div className="modal-actions">
//           <button onClick={onClose}>Cancel</button>
//           <button onClick={onSubmit} disabled={!name.trim()}>
//             {title.includes("Add") ? "Add" : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SubcategoriesList({ categoryId, categoryName }) {
//   const [subcategories, setSubcategories] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingSubcategory, setEditingSubcategory] = useState(null);
//   const [newSubcategoryName, setNewSubcategoryName] = useState("");
//   const [newSubcategoryStatus, setNewSubcategoryStatus] = useState("enabled");
//   const [subcategoryImagePreview, setSubcategoryImagePreview] = useState("");

//   // Load subcategories in real-time
//   useEffect(() => {
//     const unsubscribe = subscribeToSubcategories(categoryId, (data) => {
//       setSubcategories(data);
//     });
//     return () => unsubscribe();
//   }, [categoryId]);

//   const handleAdd = async () => {
//     if (!newSubcategoryName.trim()) return;
//     await addSubcategory(categoryId, {
//       name: newSubcategoryName,
//       status: newSubcategoryStatus,
//       image: subcategoryImagePreview || "",
//     });
//     setNewSubcategoryName("");
//     setNewSubcategoryStatus("enabled");
//     setSubcategoryImagePreview("");
//     setShowAddModal(false);
//   };

//   const handleEdit = async () => {
//     if (!editingSubcategory || !newSubcategoryName.trim()) return;
//     await updateSubcategory(categoryId, editingSubcategory.id, {
//       name: newSubcategoryName,
//       status: newSubcategoryStatus,
//       image: subcategoryImagePreview || editingSubcategory.image || "",
//     });
//     setEditingSubcategory(null);
//     setNewSubcategoryName("");
//     setNewSubcategoryStatus("enabled");
//     setSubcategoryImagePreview("");
//     setShowEditModal(false);
//   };

//   const handleDelete = async (subcategory) => {
//     if (window.confirm("Are you sure you want to delete this subcategory?")) {
//       await deleteSubcategory(categoryId, subcategory.id);
//     }
//   };

//   const toggleStatus = async (subcategory) => {
//     await toggleSubcategoryStatus(categoryId, subcategory);
//   };

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const base64 = await fileToBase64(file);
//       setSubcategoryImagePreview(base64);
//     }
//   };

//   return (
//     <>
//       <div className="subcategory-header">
//         <h4>Subcategories for {categoryName}</h4>
//         <button className="add-subcategory-btn" onClick={() => setShowAddModal(true)}>
//           <FaPlus style={{ marginRight: "8px" }} />
//           Add Subcategory
//         </button>
//       </div>
//       {subcategories.length ? (
//         <table className="categories-table">
//           <thead>
//             <tr>
//               <th>Image</th>
//               <th>Name</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {subcategories.map((sub) => (
//               <tr key={sub.id}>
//                 <td>
//                   {sub.image ? (
//                     <img src={sub.image} alt={sub.name} className="category-icon" />
//                   ) : (
//                     <div className="category-icon">{sub.name.charAt(0)}</div>
//                   )}
//                 </td>
//                 <td>{sub.name}</td>
//                 <td>
//                   <span
//                     className={`status ${sub.status || "enabled"}`}
//                     onClick={() => toggleStatus(sub)}
//                     style={{ cursor: "pointer" }}
//                   >
//                     {sub.status || "enabled"}
//                   </span>
//                 </td>
//                 <td>
//                   <button
//                     className="action-btn edit"
//                     onClick={() => {
//                       setEditingSubcategory(sub);
//                       setNewSubcategoryName(sub.name);
//                       setNewSubcategoryStatus(sub.status || "enabled");
//                       setSubcategoryImagePreview(sub.image || "");
//                       setShowEditModal(true);
//                     }}
//                   >
//                     <FaEdit />
//                   </button>
//                   <button className="action-btn delete" onClick={() => handleDelete(sub)}>
//                     <FaTrash />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No subcategories found. Click "Add Subcategory" to create one.</p>
//       )}

//       {showAddModal && (
//         <Modal
//           title="Add New Subcategory"
//           name={newSubcategoryName}
//           setName={setNewSubcategoryName}
//           status={newSubcategoryStatus}
//           setStatus={setNewSubcategoryStatus}
//           imagePreview={subcategoryImagePreview}
//           onImageChange={handleImageChange}
//           onSubmit={handleAdd}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}
//       {showEditModal && (
//         <Modal
//           title="Edit Subcategory"
//           name={newSubcategoryName}
//           setName={setNewSubcategoryName}
//           status={newSubcategoryStatus}
//           setStatus={setNewSubcategoryStatus}
//           imagePreview={subcategoryImagePreview}
//           onImageChange={handleImageChange}
//           onSubmit={handleEdit}
//           onClose={() => setShowEditModal(false)}
//         />
//       )}
//     </>
//   );
// }

// export default CategoriesPage;
