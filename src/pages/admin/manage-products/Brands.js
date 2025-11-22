import React, { useState, useEffect } from "react";
import "./BrandsPage.css";
import AdminLayout from "../../../components/AdminLayout";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  fetchBrands,
  addBrand,
  updateBrand,
  deleteBrand,
} from "../../../firebase/brandsService";

function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newBrand, setNewBrand] = useState({ name: "", logo: null });
  const [editingBrand, setEditingBrand] = useState(null);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const brandList = await fetchBrands();
      setBrands(brandList);
      setFilteredBrands(brandList);
    } catch (err) {
      console.error("Error fetching brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) setFilteredBrands(brands);
    else {
      const term = searchTerm.toLowerCase();
      setFilteredBrands(brands.filter((b) => b.name.toLowerCase().includes(term)));
    }
  }, [searchTerm, brands]);

  // Add brand
  const handleAddBrand = async () => {
    if (!newBrand.name.trim()) return;
    setLoading(true);
    try {
      await addBrand(newBrand.name, newBrand.logo);
      setNewBrand({ name: "", logo: null });
      setShowAddModal(false);
      await loadBrands();
    } catch (err) {
      console.error("Error adding brand:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit brand
  const handleEditBrand = async () => {
    setLoading(true);
    try {
      await updateBrand(editingBrand);
      setShowEditModal(false);
      setEditingBrand(null);
      await loadBrands();
    } catch (err) {
      console.error("Error editing brand:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete brand
  const handleDeleteBrand = async (brand) => {
    if (!window.confirm(`Delete "${brand.name}"?`)) return;
    setLoading(true);
    try {
      await deleteBrand(brand);
      await loadBrands();
    } catch (err) {
      console.error("Error deleting brand:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <AdminLayout>
      <div className="brands-header">
        <div>
          <h1>Brands</h1>
          <p>Manage brands here.</p>
        </div>
        <div className="brands-actions">
          <div className="search-area">
            <input
              type="text"
              placeholder="Search Brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-brand-btn" onClick={() => setShowAddModal(true)}>
            Add Brand
          </button>
        </div>
      </div>

      {loading && <div className="loader"></div>}

      {!loading && (
        <div className="brands-table-section">
          {filteredBrands.length > 0 ? (
            <table className="brands-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Logo</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand) => (
                  <tr key={brand.name}>
                    <td>{brand.name}</td>
                    <td>{brand.logo ? <img src={brand.logo} alt={brand.name} height="40" /> : "No logo"}</td>
                    <td>{brand.productIds.length}</td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          setEditingBrand(brand);
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteBrand(brand)}
                      >
                        <FaTrash color="red" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No brands found.</p>
          )}
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Brand</h2>
            <input
              type="text"
              placeholder="Brand Name"
              value={newBrand.name}
              onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.files[0] })}
            />
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button onClick={handleAddBrand} disabled={!newBrand.name.trim()}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditModal && editingBrand && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Brand</h2>
            <input
              type="text"
              value={editingBrand.name}
              onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditingBrand({ ...editingBrand, logo: e.target.files[0] })}
            />
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleEditBrand}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default BrandsPage;
