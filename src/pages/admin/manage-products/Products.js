import React, { useState, useEffect } from "react";
import "./ProductsPage.css";
import AdminLayout from "../../../components/AdminLayout";
import { FaEdit, FaTrash } from "react-icons/fa";
import { db } from "../../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

// Helper: file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    brand: "",
    currentPrice: "",
    stock: "",
    productType: "physical",
    image: null,
  });

  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsArray);
    });

    return () => unsubscribe();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      const snapshot = await getDocs(collection(db, "brands"));
      const brandsArray = snapshot.docs.map((doc) => doc.data().name);
      setBrands(brandsArray);
    };
    fetchBrands();
  }, []);

  // Add product
  const addProduct = async () => {
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        currentPrice: parseFloat(newProduct.currentPrice) || 0,
        stock: parseInt(newProduct.stock) || 0,
        createdAt: new Date(),
      });
      setNewProduct({
        name: "",
        category: "",
        brand: "",
        currentPrice: "",
        stock: "",
        productType: "physical",
        image: null,
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  // Edit product
  const editProduct = async () => {
    if (!editingProduct) return;
    try {
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, {
        name: editingProduct.name,
        category: editingProduct.category,
        brand: editingProduct.brand,
        currentPrice: parseFloat(editingProduct.currentPrice) || 0,
        stock: parseInt(editingProduct.stock) || 0,
        productType: editingProduct.productType,
        image: editingProduct.image || null,
      });
      setEditingProduct(null);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="products-header">
        <div>
          <h1>All Products</h1>
          <p>Manage and track all products here.</p>
        </div>
        <div className="products-actions">
          <div className="search-area">
            <input
              type="text"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="add-product-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-section">
        {filteredProducts.length > 0 ? (
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          background: "#eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "5px",
                          fontSize: "12px",
                          color: "#888",
                        }}
                      ></div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>${product.currentPrice}</td>
                  <td>{product.stock}</td>
                  <td>
                    {product.productType === "physical"
                      ? "Physical Product"
                      : "Digital Product"}
                  </td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <FaTrash color="red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addProduct();
              }}
            >
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
              <input
                list="brands-list"
                placeholder="Select or type a brand"
                value={newProduct.brand}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, brand: e.target.value })
                }
                required
              />
              <datalist id="brands-list">
                {brands.map((b, idx) => (
                  <option key={idx} value={b} />
                ))}
              </datalist>
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.currentPrice}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, currentPrice: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
                required
              />
              <label>Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files[0]) {
                    const base64 = await fileToBase64(e.target.files[0]);
                    setNewProduct({ ...newProduct, image: base64 });
                  }
                }}
              />
              <select
                value={newProduct.productType}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, productType: e.target.value })
                }
              >
                <option value="physical">Physical Product</option>
                <option value="digital">Digital Product</option>
              </select>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editProduct();
              }}
            >
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                required
              />
              <input
                list="brands-list"
                value={editingProduct.brand}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, brand: e.target.value })
                }
                required
              />
              <datalist id="brands-list">
                {brands.map((b, idx) => (
                  <option key={idx} value={b} />
                ))}
              </datalist>
              <input
                type="text"
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                required
              />
              <input
                type="number"
                value={editingProduct.currentPrice}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    currentPrice: e.target.value,
                  })
                }
                required
              />
              <input
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, stock: e.target.value })
                }
                required
              />
              <label>Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files[0]) {
                    const base64 = await fileToBase64(e.target.files[0]);
                    setEditingProduct({ ...editingProduct, image: base64 });
                  }
                }}
              />
              <select
                value={editingProduct.productType}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    productType: e.target.value,
                  })
                }
              >
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
              </select>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ProductsPage;
