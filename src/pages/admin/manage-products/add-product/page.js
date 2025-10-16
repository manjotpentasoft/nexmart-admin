import React from "react";
import "./AddProductPage.css";
import { FaProductHunt, FaFileCode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../components/AdminLayout";

function AddProductPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
       <div className="add-product-container">
          {/* Header */}
          <div className="add-product-header">
            <h3>Add Product</h3>
          </div>

          {/* Grid */}
          <div className="add-product-grid">
            {/* Physical Product */}
            <div
              className="product-card"
              onClick={() => navigate("/admin/create/physical")}
            >
              <div className="icon blue">
                <FaProductHunt />
              </div>
              <h4>Add Physical Product</h4>
            </div>

            {/* Digital Product */}
            <div
              className="product-card"
              onClick={() => navigate("/admin/create/digital")}
            >
              <div className="icon light-blue">
                <FaFileCode />
              </div>
              <h4>Add Digital Product</h4>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}

export default AddProductPage;
