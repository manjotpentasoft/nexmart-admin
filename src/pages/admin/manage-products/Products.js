import React, { useState, useEffect } from "react";
import "./ProductsPage.css";
import AdminLayout from "../../../components/AdminLayout";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts,
  subscribeToProducts,
  updateProduct,
  deleteProduct,
  fileToBase64,
} from "../../../firebase/productsService";

function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Subscribe to products
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
      setCurrentPage(1);
    });
    return () => unsubscribe();
  }, []);

  // Fetch brands and categories
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [brandList, categoryList] = await Promise.all([
          fetchProducts("brands"),
          fetchProducts("categories"),
        ]);
        setBrands(brandList.map((b) => b.name || b));
        setCategories(categoryList.map((c) => c.name || c));
      } catch (err) {
        console.error("Error fetching brand/category data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + entriesToShow
  );

  const handleAddProduct = () => {
    navigate(`/admin/create`);
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    setLoading(true);
    try {
      await updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderProductImage = (image, name) => {
    if (!image) return <div className="no-image">No Image</div>;
    const isLocal = image.startsWith("./") || image.startsWith("/assets");
    const imageUrl = isLocal
      ? `${process.env.PUBLIC_URL}${image.replace(".", "")}`
      : image;
    return <img src={imageUrl} alt={name} className="product-image" />;
  };

  return (
    <AdminLayout>
      <div className="products-header">
        <div>
          <h1>All Products</h1>
          <p>Manage and track all products here.</p>
        </div>
        <div className="products-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-product-btn" onClick={handleAddProduct}>
            Add Product
          </button>
        </div>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {!loading && (
        <div className="products-table-section">
          {paginatedProducts.length > 0 ? (
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
                {paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{renderProductImage(product.image, product.name)}</td>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>{product.category}</td>
                    <td>${product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      {product.productType === "physical" ? "Physical" : "Digital"}
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
                        onClick={() => confirmDeleteProduct(product)}
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

          {filteredProducts.length > entriesToShow && (
            <div className="table-footer">
              <div className="entries-info">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + entriesToShow, filteredProducts.length)} of{" "}
                {filteredProducts.length} entries
              </div>
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showEditModal && editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Product</h2>

            <label>Name</label>
            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
            />

            <label>Brand</label>
            <input
              list="brands-list"
              value={editingProduct.brand}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, brand: e.target.value })
              }
            />
            <datalist id="brands-list">
              {brands.map((b, idx) => (
                <option key={idx} value={b} />
              ))}
            </datalist>

            <label>Category</label>
            <input
              list="categories-list"
              value={editingProduct.category}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  category: e.target.value,
                })
              }
            />
            <datalist id="categories-list">
              {categories.map((c, idx) => (
                <option key={idx} value={c} />
              ))}
            </datalist>

            <label>Price</label>
            <input
              type="number"
              value={editingProduct.price}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price: e.target.value,
                })
              }
            />

            <label>Stock</label>
            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  stock: e.target.value,
                })
              }
            />

            <label>Image</label>
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
            <input
              type="text"
              placeholder="Or enter image path"
              value={editingProduct.image || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  image: e.target.value,
                })
              }
            />

            <label>Type</label>
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
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleEditProduct}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && productToDelete && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete <b>{productToDelete.name}</b>?
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="delete-btn" onClick={handleDeleteConfirmed}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ProductsPage;
