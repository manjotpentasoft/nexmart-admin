import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home/SimilarProducts.css";
import { subscribeToProducts } from "../../firebase/productsService";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function SimilarProducts({ categoryId, currentProductId }) {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [hovered, setHovered] = useState(null);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryId) return;

    const unsubscribe = subscribeToProducts(
      (products) => {
        const filtered = products
          .filter(
            (p) =>
              p.category === categoryId && p.id !== currentProductId
          )
          .slice(0, 12); // limit to 12
        setSimilarProducts(filtered);
      },
      { category: categoryId } 
    );

    return () => unsubscribe();
  }, [categoryId, currentProductId]);

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (typeof img === "string") return img;
    if (typeof img === "object" && img.url) return img.url;
    return "/placeholder.png";
  };

  const scrollLeft = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cardWidth = slider.querySelector(".sp-card")?.offsetWidth || 200;
    slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
  };

  const scrollRight = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cardWidth = slider.querySelector(".sp-card")?.offsetWidth || 200;
    slider.scrollBy({ left: cardWidth, behavior: "smooth" });
  };

  if (!similarProducts.length) return null;

  return (
    <div className="similar-products-section">
      <div className="sp-header">
        <h2 className="similar-products-title">Similar Products</h2>
        <div className="sp-arrows">
          <button className="sp-arrow-btn" onClick={scrollLeft}>
            <FaArrowLeft />
          </button>
          <button className="sp-arrow-btn" onClick={scrollRight}>
            <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="sp-slider" ref={sliderRef}>
        {similarProducts.map((prod) => (
          <div
            key={prod.id}
            className={`sp-card ${hovered === prod.id ? "hovered" : ""}`}
            onClick={() => navigate(`/product/view/${prod.id}`)}
            onMouseEnter={() => setHovered(prod.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="sp-img-wrapper">
              <img
                src={getImageUrl(prod.image)}
                alt={prod.name}
                className="sp-img"
              />
            </div>
            <div className="sp-info">
              <div className="sp-name">{prod.name}</div>
              <div className="sp-price">
                ₹{parseFloat(prod.price || 0).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
