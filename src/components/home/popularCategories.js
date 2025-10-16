import React, { useEffect, useRef, useState } from "react";
import "../../styles/home/PopularCategories.css";
import { subscribeToCategories } from "../../firebase/categoriesService";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function PopularCategories() {
  const [categories, setCategories] = useState([]);
  const sliderRef = useRef(null);

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

  // Fetch categories in real-time using the service
  useEffect(() => {
    const unsubscribe = subscribeToCategories((data) => {
      setCategories(data);
    });
    return () => unsubscribe();
  }, []);

  // Slider drag logic
  useEffect(() => {
    const slider = document.querySelector(".pc-cat-row");
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
      const walk = (x - startX) * 2; // scroll-fast multiplier
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

  const scrollLeftFn = () => {
    const slider = sliderRef.current;
    if (slider) {
      const cardWidth =
        slider.querySelector(".pc-cat-card")?.offsetWidth || 210;
      slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRightFn = () => {
    const slider = sliderRef.current;
    if (slider) {
      const cardWidth =
        slider.querySelector(".pc-cat-card")?.offsetWidth || 210;
      slider.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  return (
    <div className="pc-main">
      {/* Header Row */}
      <div className="pc-header">
        <span className="pc-title">Popular Categories</span>
        <div className="arrows">
          <button className="arrow-btn" onClick={scrollLeftFn}>
            <FaArrowLeft />
          </button>
          <button className="arrow-btn" onClick={scrollRightFn}>
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Category Row */}
      <div className="pc-cat-row" ref={sliderRef}>
        {categories.map((cat, i) => (
          <div className="pc-cat-card" key={cat.id || i}>
            <img src={cat.image} alt={cat.name} className="pc-cat-img" />
            <div className="pc-cat-label">{cat.name}</div>
            <div className="pc-cat-count">{cat.items || 0} items</div>
          </div>
        ))}
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
            <a className="pc-promo-btn" href="#">
              {promo.btn}
            </a>
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
