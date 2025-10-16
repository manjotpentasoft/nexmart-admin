import React, { useEffect, useState } from "react";
import { subscribeToCollection } from "../../firebase/firestoreService";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const unsubscribeProducts = subscribeToCollection("products", setProducts);
    return () => {
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShopNow = () => navigate(`/shop`);

  return (
    <>
      <div className="category-row">
        {products.map((product) => (
          <span key={product.id} className="cat-item">
            <img src={product.image} alt={product.name} className="cat-img" />
            {product.name}
          </span>
        ))}
      </div>
      <section className="hero-section">
        <div className="hero-text">
          <span className="badge">NEW RELEASE</span>
          <h1>
            <span className="hero-blue">Small Screen Wonders</span>
            <br />
            <span className="hero-bold">Tales Beyond All</span>
          </h1>
          <span className="hero-sub">
            Starting From <span className="price">$83.99</span>
          </span>
          <button className="shop-btn" onClick={handleShopNow}>Shop Now</button>
        </div>

        <div className="hero-visual">
          {[
            "./assets/images/banner/banner-img-1.png",
            "./assets/images/banner/banner-img-2.png",
          ].map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`TV ${index + 1}`}
              className={`tv-img hero-slide ${
                currentImage === index ? "active" : ""
              }`}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default HeroSection;
