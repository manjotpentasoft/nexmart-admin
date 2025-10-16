import React, { useEffect, useState } from "react";
import { fetchCollection } from "../../firebase/firestoreService";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/CartSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/home/HomeTopSold.css";
import bgImage from "../../assets/cta-bg.jpg";

export default function HomeTopSold() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // dynamic categories
  const [filter, setFilter] = useState("All");
  const userId = "demoUser"; // Replace with auth.uid if using Firebase Auth

  //  Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const allProducts = await fetchCollection("products");
        const allCategories = await fetchCollection("categories");

        setCategories(allCategories.map((c) => c.name));

        // Get top sold products
        const topSold = allProducts
          .filter((p) => p.salesCount > 0)
          .sort((a, b) => b.salesCount - a.salesCount)
          .slice(0, 8);

        setProducts(topSold);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load products");
      }
    };

    loadData();
  }, []);

  //  Add to Cart handler with toast
  const handleAddToCart = async (product) => {
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      toast.error("Invalid product data.");
      return;
    }

    try {
      await dispatch(addToCart(userId, product));
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart.");
    }
  };

  //  Filter products based on selected category
  const filteredProducts =
    filter === "All"
      ? products
      : products.filter((p) => p.category === filter);

  return (
    <div className="hotsold-container">
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar />

      {/* Hero Section */}
      <section
        className="hotsold-hero"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hotsold-hero-text">
          <span className="hotsold-badge">TRENDING</span>
          <h1>Get the Virtual Experience</h1>
          <p>
            Starting From <strong>₹83.99</strong>
          </p>
          <button className="hotsold-shop-btn">Shop Now</button>
        </div>
      </section>

      {/* Top Sold Products */}
      <section className="hotsold-products-section">
        <div className="hotsold-products-header">
          <h2>Top Sold Products</h2>
          <nav className="hotsold-filter-nav">
            <button
              className={
                filter === "All"
                  ? "hotsold-filter-btn active"
                  : "hotsold-filter-btn"
              }
              onClick={() => setFilter("All")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={
                  filter === cat
                    ? "hotsold-filter-btn active"
                    : "hotsold-filter-btn"
                }
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className="hotsold-products-list">
          {filteredProducts.map((product) => (
            <div key={product.id} className="hotsold-product-card">
              <img
                src={product.image || product.imageUrl || "/placeholder.png"}
                alt={product.name}
                className="hotsold-product-image"
              />

              <div className="hotsold-product-name">{product.name}</div>

              <div className="hotsold-product-rating">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < (product.rating || 0) ? "filled" : ""}`}
                    >
                      ★
                    </span>
                  ))}{" "}
                <span>({product.reviewsCount || 0})</span>
              </div>

              <div className="hotsold-product-price">
                ₹{Number(product.price).toFixed(2)}
              </div>

              <button
                className="hotsold-add-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
