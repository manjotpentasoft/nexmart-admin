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
  addToWishlist,
  removeFromWishlist,
  subscribeToWishlist,
} from "../../firebase/wishlistService";
import { getAuth } from "firebase/auth";

export default function PopularProducts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const sliderRef = useRef(null);
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid || "demoUser"; // replace with actual auth UID

  // Subscribe to wishlist in real-time
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToWishlist(userId, setWishlist);
    return () => unsub();
  }, [userId]);

  // Check if a product is in wishlist
  const isInWishlist = (productId) =>
    wishlist.some((item) => item.id === productId);

  const toggleWishlist = async (product) => {
    if (!userId || !product?.id || loadingWishlist) return;
    setLoadingWishlist(true);
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(userId, product.id);
      } else {
        await addToWishlist(userId, product);
      }
    } finally {
      setLoadingWishlist(false);
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

  //  Realtime Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeToCollection("products", setProducts);
    return () => unsubscribe();
  }, []);

  //  Slider drag logic
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDown = (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };
    const mouseLeave = () => {
      isDown = false;
      slider.classList.remove("active");
    };
    const mouseUp = () => {
      isDown = false;
      slider.classList.remove("active");
    };
    const mouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", mouseDown);
    slider.addEventListener("mouseleave", mouseLeave);
    slider.addEventListener("mouseup", mouseUp);
    slider.addEventListener("mousemove", mouseMove);

    return () => {
      slider.removeEventListener("mousedown", mouseDown);
      slider.removeEventListener("mouseleave", mouseLeave);
      slider.removeEventListener("mouseup", mouseUp);
      slider.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  //  Scroll buttons
  const scrollLeftFunc = () => {
    const slider = sliderRef.current;
    if (slider) {
      const cardWidth =
        slider.querySelector(".pc-cat-card")?.offsetWidth || 210;
      slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRightFunc = () => {
    const slider = sliderRef.current;
    if (slider) {
      const cardWidth =
        slider.querySelector(".pc-cat-card")?.offsetWidth || 210;
      slider.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));
  };

  const handleViewProduct = (id) => navigate(`/product/view/${id}`);

  //  Fixed add to cart logic
  const handleCart = async (product) => {
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }
    try {
      await dispatch(addToCart(userId, product));
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="pc-main">
      {/* Header Row */}
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

      {/* Category Row */}
      <div className="pc-cat-row" ref={sliderRef}>
        {products.length === 0 ? (
          <div className="empty-cart">No products found.</div>
        ) : (
          products.map((product, i) => (
            <div
              className={`pc-cat-card ${
                hoveredProduct === product.id ? "hovered" : ""
              }`}
              key={product.id || i}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Category/Brand */}
              {product.category && (
                <div className="pc-product-category">{product.category}</div>
              )}
              <div className="pc-cat-brand">{product.brand}</div>

              {/* Image */}
              <img
                src={product.image || product.imageUrl || "/placeholder.png"}
                alt={product.name}
                className="pc-cat-img"
              />

              {/* Name */}
              <div className="pc-cat-label">{product.name}</div>

              {/* Price */}
              <div className="pc-price-section">
                <div className="pc-cat-price">
                  ₹{Number(product.price).toFixed(2)}
                </div>
                {product.originalPrice && (
                  <div className="pc-original-price">
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="pc-rating">
                  {renderStars(product.rating)}
                  <span className="pc-rating-count">({product.rating})</span>
                </div>
              )}

              {/* Stock Status */}
              {product.stock && (
                <div
                  className={`pc-stock ${
                    product.stock === "Stock Out" ? "out-of-stock" : ""
                  }`}
                >
                  {product.stock}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="pc-hover-overlay">
                <div className="pc-hover-actions">
                  <button
                    style={{
                      background: isInWishlist(product.id)
                        ? "#FF0000"
                        : "#E92530",
                      borderRadius: "50%",
                      padding: "10px",
                    }}
                    onClick={() => toggleWishlist(product)}
                  >
                    <FaHeart />
                  </button>
                  <button
                    style={{
                      background: "#E92530",
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

      {/* Promos Row */}
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
