import { useState } from "react";
import "./CreateProductForm.css";
import AdminSidebar from "../../../../components/AdminSidebar";
import { useSidebar } from "../../../../contexts/SidebarContext";
import { db } from "../../../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import useCategories from "./useCategoriesHook"; 

function CreateDigitalProduct() {
  const { isSidebarOpen } = useSidebar();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    featuredImage: null,
    galleryImages: [],
    shortDescription: "",
    currentPrice: "",
    previousPrice: "",
    category: "",
    subCategory: "",
    brand: "",
    stock: ""
  });

  const { categories, subCategories, brands } = useCategories(formData.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (name === "featuredImage" && files[0]) {
      setFormData({ ...formData, featuredImage: await fileToBase64(files[0]) });
    } else if (name === "galleryImages" && files.length > 0) {
      const array = await Promise.all([...files].map(file => fileToBase64(file)));
      setFormData({ ...formData, galleryImages: array });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "products"), {
        ...formData,
        productType: "digital",
        createdAt: new Date()
      });
      alert("Digital product added successfully!");
      setFormData({
        name: "",
        slug: "",
        featuredImage: null,
        galleryImages: [],
        shortDescription: "",
        currentPrice: "",
        previousPrice: "",
        category: "",
        subCategory: "",
        brand: "",
        stock: ""
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add product. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />
      <div className={`admin-dashboard-main ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="create-product-container">
          <div className="create-product-header">
            <h1>Create Digital Product</h1>
            <p>Add a new product to your store</p>
          </div>

          <form className="create-product-form" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slug">Slug *</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    placeholder="Enter Slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="form-section">
              <h3>Images</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="featuredImage">Featured Image *</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="featuredImage"
                      name="featuredImage"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                    <div className="upload-placeholder">
                      <span>Upload Image...</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                  <p className="image-help-text">
                    Image Size Should Be 800 x 800, or square size
                  </p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="galleryImages">Gallery Images</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="galleryImages"
                      name="galleryImages"
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                    />
                    <div className="upload-placeholder">
                      <span>Upload Image...</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                  <p className="image-help-text">
                    Image Size Should Be 800 x 800, or square size
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-section">
              <h3>Description</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="shortDescription">Short Description *</label>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    placeholder="Short Description"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="form-section">
              <h3>Pricing</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentPrice">Current Price *</label>
                  <input
                    type="number"
                    id="currentPrice"
                    name="currentPrice"
                    placeholder="Enter Current Price"
                    value={formData.currentPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="previousPrice">Previous Price</label>
                  <input
                    type="number"
                    id="previousPrice"
                    name="previousPrice"
                    placeholder="Enter Previous Price"
                    value={formData.previousPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="form-section">
              <h3>Categories</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Select Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select One</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subCategory">Select Sub Category</label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                  >
                    <option value="">Select One</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="brand">Select Brand</label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Brand</option>
                    {brands.length > 0 ? (
                      brands.map(brand => (
                        <option key={brand.id} value={brand.slug || brand.name}>{brand.name}</option>
                      ))
                    ) : (
                      <option disabled>No brands found</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="stock">Total Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    placeholder="Enter Total Stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button type="button" className="save-edit-btn">Save & Edit</button>
              <button type="button" className="view-website-btn">View Website</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateDigitalProduct;
