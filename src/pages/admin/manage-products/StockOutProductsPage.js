import React, { useState, useEffect } from "react";
import "./StockOutProductsPage.css";
import { FaTrash } from "react-icons/fa";
import AdminLayout from "../../../components/AdminLayout";
import {
  subscribeToCollection,
  deleteDocument,
} from "../../../firebase/firestoreService";

function StockOutProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 Real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToCollection("products", (allProducts) => {
      const outOfStock = allProducts.filter(
        (product) => parseInt(product.stock) <= 0
      );
      setProducts(outOfStock);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Search filter
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredProducts.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + entriesToShow
  );

  // 🔹 Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDocument("products", id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="stockout-header">
        <div>
          <h1>Stock Out Products</h1>
          <p>Manage products that are out of stock</p>
        </div>
      </div>

      {/* Controls */}
      <div className="table-controls">
        <div className="entries-selector">
          <span>Show</span>
          <select
            value={entriesToShow}
            onChange={(e) => setEntriesToShow(parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        <div className="search-area">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="stockout-table-section">
        {paginatedProducts.length > 0 ? (
          <table className="stockout-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Type</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image || "/assets/images/shop/default.png"}
                      alt={product.name}
                      className="product-image"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>
                    ${product.price ?? product.previousPrice ?? 0}
                  </td>
                  <td>
                    <span className="status-badge out-of-stock">
                      Out of Stock
                    </span>
                  </td>
                  <td>{product.productType || "Standard"}</td>
                  <td>{product.category || "Standard"}</td>
                  <td>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      <FaTrash color="red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data-message">
            <p>No data available in table</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="table-footer">
        <div className="entries-info">
          Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + entriesToShow, filteredProducts.length)} of{" "}
          {filteredProducts.length} entries
        </div>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default StockOutProductsPage;
