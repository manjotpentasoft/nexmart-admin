import React, { useEffect, useState, useRef } from "react";
import "../../styles/home/PopularCategories.css";
import { subscribeToCollection } from "../../firebase/firestoreService";
import {
  FaArrowLeft,
  FaArrowRight,
  FaShoppingCart,
  FaHeart,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/CartSlice";
import {
  subscribeToWishlist,
  toggleWishlistItem,
} from "../../firebase/wishlistService";
import { auth } from "../../firebase/firebaseConfig";
import { toast } from "react-toastify";

export default function PopularProducts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const sliderRef = useRef(null);
  const [wishlist, setWishlist] = useState([]);  const [userId, setUserId] = useState(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  // Subscribe to wishlist realtime
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToWishlist(userId, setWishlist);
    return () => unsub();
  }, [userId]);

  const isInWishlist = (id) => wishlist.some((item) => item.id === id);

  const toggleWishlist = async (product) => {
    if (!userId || !product?.id) return toast.error("Login required!");
    try {
      await toggleWishlistItem(userId, product);
      toast.success(`${product.name} wishlist updated!`);
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  // Subscribe to products
  useEffect(() => {
    const unsubscribe = subscribeToCollection("products", setProducts);
    return () => unsubscribe();
  }, []);

  // Scroll logic for slider
  const scrollLeftFunc = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cardWidth = slider.querySelector(".pc-cat-card")?.offsetWidth || 210;
    slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
  };

  const scrollRightFunc = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cardWidth = slider.querySelector(".pc-cat-card")?.offsetWidth || 210;
    slider.scrollBy({ left: cardWidth, behavior: "smooth" });
  };

  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));

  const handleViewProduct = (id) => navigate(`/product/view/${id}`);

  //  Fixed add-to-cart logic (dispatch thunk correctly)
  const handleCart = async (product) => {
    if (!userId) {
      toast.error("Please log in to add to cart");
      return;
    }
    if (!product?.id) {
      console.error("Invalid product:", product);
      return;
    }
    try {
      await dispatch(addToCart(userId, { ...product, quantity: 1 }));
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const promos = [
    {
      label: "FEATURED",
      title: "Smart TV's",
      price: "From ₹99.99",
      btn: "Shop now",
      bg: "#f6eed2",
      img: "./assets/images/shop/shop-7.png",
      floatImg: "/assets/football-leg.png",
      floatStyle: { position: "absolute", right: 60, top: 20, width: 120 },
    },
    {
      label: "HOT SALE",
      title: "Kitchen Kits",
      price: "From ₹50 Only",
      btn: "Shop now",
      bg: "#ededed",
      img: "./assets/images/shop/shop-8.png",
    },
    {
      label: "LATEST DEALS",
      title: "Smart Device",
      price: "From ₹499.99",
      btn: "Shop now",
      bg: "#fdeaea",
      img: "./assets/images/shop/shop-9.png",
    },
  ];

  return (
    <div className="pc-main">
      <div className="pc-header">
        <span className="pc-title">Today's popular picks</span>
        <div className="arrows">
          <button className="arrow-btn" onClick={scrollLeftFunc}>
            <FaArrowLeft />
          </button>
          <button className="arrow-btn" onClick={scrollRightFunc}>
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Product Slider */}
      <div className="pc-cat-row" ref={sliderRef}>
        {products.length === 0 ? (
          <div className="empty-cart">No products found.</div>
        ) : (
          products.map((product) => (
            <div
              className={`pc-cat-card ${
                hoveredProduct === product.id ? "hovered" : ""
              }`}
              key={product.id}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {product.category && (
                <div className="pc-product-category">{product.category}</div>
              )}
              <div className="pc-cat-brand">{product.brand}</div>

              <img
                src={product.image || product.imageUrl || "/placeholder.png"}
                alt={product.name}
                className="pc-cat-img"
              />

              <div className="pc-cat-label">{product.name}</div>

              <div className="pc-price-section">
                <div className="pc-cat-price">
                  ₹{Number(product.price || 0).toFixed(2)}
                </div>
                {product.originalPrice && (
                  <div className="pc-original-price">
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </div>
                )}
              </div>

              {product.rating && (
                <div className="pc-rating">
                  {renderStars(product.rating)}
                  <span className="pc-rating-count">({product.rating})</span>
                </div>
              )}

              {product.stock && (
                <div
                  className={`pc-stock ${
                    product.stock === "Stock Out" ? "out-of-stock" : ""
                  }`}
                >
                  {product.stock}
                </div>
              )}

              <div className="pc-hover-overlay">
                <div className="pc-hover-actions">
                  <button
                    style={{
                      background: isInWishlist(product.id)
                        ? "#FF0000"
                        : "#1e3a8a",
                      borderRadius: "50%",
                      padding: "10px",
                    }}
                    onClick={() => toggleWishlist(product)}
                  >
                    <FaHeart />
                  </button>
                  <button
                    style={{
                      background: "#1e3a8a",
                      borderRadius: "50%",
                      padding: "10px",
                    }}
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <FaEye />
                  </button>
                </div>
                <button
                  className="pc-hover-btn pc-cart-btn"
                  onClick={() => handleCart(product)}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Promo Row */}
      <div className="pc-promos-row">
        {promos.map((promo, i) => (
          <div
            className="pc-promo-card"
            key={i}
            style={{ background: promo.bg, position: "relative" }}
          >
            <div className="pc-promo-label">{promo.label}</div>
            <div className="pc-promo-title">{promo.title}</div>
            <div className="pc-promo-price">{promo.price}</div>
            <a className="pc-promo-btn">{promo.btn}</a>
            <img src={promo.img} className="pc-promo-img" alt={promo.title} />
            {promo.floatImg && (
              <img
                src={promo.floatImg}
                style={promo.floatStyle}
                alt=""
                className="pc-anim"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
