import React, { useState, useEffect } from "react";
import "./BrandsPage.css";
import AdminLayout from "../../../components/AdminLayout";
import { FaEdit, FaTrash } from "react-icons/fa";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// helper: file to base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newBrand, setNewBrand] = useState({ name: "", logo: null });
  const [editingBrand, setEditingBrand] = useState(null);

  // Fetch brands from products + existing brands collection
  const fetchBrands = async () => {
    const productSnapshot = await getDocs(collection(db, "products"));
    const brandMap = new Map();

    // Gather brands from products
    productSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.brand) {
        const name = data.brand.trim();
        if (!brandMap.has(name)) brandMap.set(name, { name, productIds: [doc.id], logo: null });
        else brandMap.get(name).productIds.push(doc.id);
      }
    });

    // Merge existing logos from brands collection
    const brandsSnapshot = await getDocs(collection(db, "brands"));
    brandsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (brandMap.has(data.name)) brandMap.get(data.name).logo = data.logo || null;
      else brandMap.set(data.name, { name: data.name, productIds: [], logo: data.logo || null });
    });

    const brandsArray = Array.from(brandMap.values());
    setBrands(brandsArray);
    setFilteredBrands(brandsArray);
  };

  useEffect(() => {
    fetchBrands();
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
  const addBrand = async () => {
    if (!newBrand.name.trim()) return;
    try {
      const logoBase64 = newBrand.logo ? await fileToBase64(newBrand.logo) : null;
      await addDoc(collection(db, "brands"), { name: newBrand.name.trim(), logo: logoBase64, createdAt: new Date() });
      setNewBrand({ name: "", logo: null });
      setShowAddModal(false);
      fetchBrands();
    } catch (err) {
      console.error("Error adding brand:", err);
    }
  };

  // Edit brand (updates products & brands collection)
  const editBrandName = async () => {
    if (!editingBrand) return;
    try {
      // Update all linked products
      const batchUpdates = editingBrand.productIds.map((productId) => {
        const productRef = doc(db, "products", productId);
        return updateDoc(productRef, { brand: editingBrand.name });
      });

      // Update or create brand document
      const brandsSnapshot = await getDocs(collection(db, "brands"));
      let found = false;
      for (const docSnap of brandsSnapshot.docs) {
        if (docSnap.data().name === editingBrand.originalName) {
          const brandRef = doc(db, "brands", docSnap.id);
          const logo = editingBrand.logo instanceof File ? await fileToBase64(editingBrand.logo) : editingBrand.logo;
          await updateDoc(brandRef, { name: editingBrand.name, logo });
          found = true;
        }
      }

      if (!found && editingBrand.logo instanceof File) {
        const logoBase64 = await fileToBase64(editingBrand.logo);
        await addDoc(collection(db, "brands"), { name: editingBrand.name, logo: logoBase64, createdAt: new Date() });
      }

      await Promise.all(batchUpdates);
      setShowEditModal(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (err) {
      console.error("Error editing brand:", err);
    }
  };

  // Delete brand (removes products + brand doc)
  const deleteBrand = async (brand) => {
    if (!window.confirm(`Delete all products under "${brand.name}"?`)) return;
    try {
      const deletes = brand.productIds.map((id) => deleteDoc(doc(db, "products", id)));
      await Promise.all(deletes);

      const brandsSnapshot = await getDocs(collection(db, "brands"));
      for (const docSnap of brandsSnapshot.docs) {
        if (docSnap.data().name === brand.name) await deleteDoc(doc(db, "brands", docSnap.id));
      }

      fetchBrands();
    } catch (err) {
      console.error("Error deleting brand:", err);
    }
  };

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
                  <td>{brand.logo ? <img src={brand.logo} alt={brand.name} height="40" /> : <span>No logo</span>}</td>
                  <td>{brand.productIds.length}</td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => setEditingBrand({ ...brand, originalName: brand.name }) || setShowEditModal(true)}
                    >
                      <FaEdit />
                    </button>
                    <button className="action-btn delete" onClick={() => deleteBrand(brand)}>
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
              required
            />
            <input type="file" accept="image/*" onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.files[0] })} />
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button onClick={addBrand} disabled={!newBrand.name.trim()}>
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
            <input type="file" accept="image/*" onChange={(e) => setEditingBrand({ ...editingBrand, logo: e.target.files[0] })} />
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={editBrandName}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default BrandsPage;
