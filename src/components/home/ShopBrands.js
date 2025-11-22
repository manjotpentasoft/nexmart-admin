import React, { useEffect, useState } from "react";
import "../../styles/home/ShopBrands.css";
import { fetchBrands } from "../../firebase/brandsService";

const ShopBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      setLoading(true);
      try {
        const brandList = await fetchBrands();
        setBrands(brandList);
      } catch (err) {
        console.error("Error loading brands:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  if (loading) {
    return (
      <div className="shop-container">
        <section className="brands-section">
          <h2 className="brand-section-title">Shop by Brands</h2>
          <div className="loader"></div>
        </section>
      </div>
    );
  }

  if (!brands.length) {
    return (
      <div className="shop-container">
        <section className="brands-section">
          <h2 className="section-title">Shop by Brands</h2>
          <p className="empty-text">No brands available right now.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <section className="brands-section">
        <h2 className="section-title">Shop by Brands</h2>
        <div className="brands-grid">
          {brands.map((brand) => (
            <div key={brand.id || brand.name} className="brand-item">
              <div className="brand-logo-container">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="brand-logo"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                ) : null}
                <span
                  className="brand-name-fallback"
                  style={{ display: brand.logo ? "none" : "block" }}
                >
                  {brand.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShopBrands;
