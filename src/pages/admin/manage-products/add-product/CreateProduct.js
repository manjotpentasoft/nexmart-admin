import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useCategories from "./useCategoriesHook";
import {
  addProduct,
  processImages,
} from "../../../../firebase/productsService";
import "./CreateProductForm.css";

export default function ProductForm({ productType }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: null,
    galleryImages: [],
    shortDescription: "",
    longDescription: "",
    price: "",
    previousPrice: "",
    category: "",
    subCategory: "",
    brand: "",
    stock: "",
    color: "",
    size: "",
    weight: "",
    tags: "",
    specifications: [{ key: "", value: "" }],
  });

  const { categories, subCategories, brands } = useCategories(
    formData.category
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle basic inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file upload (single or multiple)
  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (!files.length) return;

    if (name === "image") {
      const base64 = await processImages(files[0]);
      setFormData({ ...formData, image: base64 });
    } else if (name === "galleryImages") {
      const array = await processImages([...files]);
      setFormData({ ...formData, galleryImages: array });
    }
  };

  // Dynamic Specifications
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: "", value: "" }],
    });
  };

  const removeSpecification = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData({ ...formData, specifications: newSpecs });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addProduct({
        ...formData,
        price: parseFloat(formData.price) || 0,
        previousPrice: parseFloat(formData.previousPrice) || 0,
        stock: parseInt(formData.stock) || 0,
        productType,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      });
      toast.success(`${productType} product added successfully!`);
      setFormData({
        name: "",
        slug: "",
        image: null,
        galleryImages: [],
        shortDescription: "",
        longDescription: "",
        price: "",
        previousPrice: "",
        category: "",
        subCategory: "",
        brand: "",
        stock: "",
        color: "",
        size: "",
        weight: "",
        tags: "",
        specifications: [{ key: "", value: "" }],
      });
    } catch (error) {
      toast.error("Failed to add product. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-product-container">
      <ToastContainer position="top-right" />
      <div className="create-product-header">
        <h1>
          Create {productType === "physical" ? "Physical" : "Digital"} Product
        </h1>
      </div>

      <form className="create-product-form" onSubmit={handleSubmit}>
        {/* BASIC INFO */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Slug *</label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* IMAGES */}
        <div className="form-section">
          <h3>Images</h3>
          <div className="form-group">
            <label>Featured Image *</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Featured" />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Gallery Images</label>
            <input
              type="file"
              name="galleryImages"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {formData.galleryImages.length > 0 && (
              <div className="gallery-previews">
                {formData.galleryImages.map((img, i) => (
                  <img key={i} src={img} alt={`Gallery ${i + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTIONS */}
        <div className="form-section">
          <h3>Description</h3>
          <div className="form-group full-width">
            <label>Short Description *</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group full-width">
            <label>Long Description</label>
            <textarea
              name="longDescription"
              rows="5"
              value={formData.longDescription}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* PRICING */}
        <div className="form-section">
          <h3>Pricing</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Current Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Previous Price</label>
              <input
                type="number"
                name="previousPrice"
                value={formData.previousPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="form-section">
          <h3>Categories</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sub Category</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.slug || brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* EXTRA ATTRIBUTES */}
        <div className="form-section">
          <h3>Additional Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <input
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input
                name="size"
                value={formData.size}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Tags</label>
            <input
              name="tags"
              placeholder="Comma separated (e.g., new, sale, featured)"
              value={formData.tags}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* SPECIFICATIONS */}
        <div className="form-section">
          <h3>Specifications</h3>
          {formData.specifications.map((spec, index) => (
            <div className="form-row" key={index}>
              <div className="form-group">
                <input
                  placeholder="Key (e.g., Model Name)"
                  value={spec.key}
                  onChange={(e) =>
                    handleSpecChange(index, "key", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <input
                  placeholder="Value (e.g., Sharp Full Auto Front)"
                  value={spec.value}
                  onChange={(e) =>
                    handleSpecChange(index, "value", e.target.value)
                  }
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="remove-spec-btn"
                  onClick={() => removeSpecification(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-spec-btn"
            onClick={addSpecification}
          >
            + Add Specification
          </button>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button type="button" className="save-edit-btn">
            Save & Edit
          </button>
          <button type="button" className="view-website-btn">
            View Website
          </button>
        </div>
      </form>
    </div>
  );
}
