import React, { useEffect, useState } from "react";
import { fetchBrands } from "../../firebase/brandsService";
import { subscribeToCategories } from "../../firebase/categoriesService";
import "../../styles/home/FilterShopSidebar.css";

const FilterSidebar = ({ filter, setFilter, className }) => {
  const safeFilter = {
    price: filter?.price || [130, 10000],
    brand: filter?.brand || [],
    category: filter?.category || [],
    status: filter?.status || [],
    sort: filter?.sort || "none",
  };

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandList = await fetchBrands();
        setBrands(brandList);
      } catch (err) {
        console.error("Error loading brands:", err);
      } finally {
        setLoadingBrands(false);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCategories((catList) => {
      setCategories(catList);
      setLoadingCategories(false);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const statusOptions = ["In Stock", "Out of Stock"];

  return (
    <aside className={`filter-sidebar ${className || ""}`}>
      <div className="filter-section">
        <h3>Filter by Price</h3>
        <input
          type="range"
          min="100"
          max="500"
          value={safeFilter.price[1]}
          onChange={(e) =>
            setFilter((f) => ({ ...f, price: [130, Number(e.target.value)] }))
          }
        />
        <span>Price: ₹{safeFilter.price[0]} - ₹{safeFilter.price[1]}</span>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <h3>Select Category</h3>
        {loadingCategories ? (
          <div className="loader"></div>
        ) : categories.length === 0 ? (
          <p className="no-brands">No categories found</p>
        ) : (
          categories.map((cat) => (
            <label key={cat.id || cat.name} className="brand-option">
              <input
                type="checkbox"
                checked={safeFilter.category.includes(cat.name)}
                onChange={() =>
                  setFilter((f) => ({
                    ...f,
                    category: f.category.includes(cat.name)
                      ? f.category.filter((c) => c !== cat.name)
                      : [...f.category, cat.name],
                  }))
                }
              />
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="brand-logo-small"
                />
              )}
              <span>{cat.name}</span>
            </label>
          ))
        )}
      </div>

      {/* Brand Filter */}
      <div className="filter-section">
        <h3>Select Brand</h3>
        {loadingBrands ? (
          <div className="loader"></div>
        ) : brands.length === 0 ? (
          <p className="no-brands">No brands found</p>
        ) : (
          brands.map((brand) => (
            <label key={brand.id || brand.name} className="brand-option">
              <input
                type="checkbox"
                checked={safeFilter.brand.includes(brand.name)}
                onChange={() =>
                  setFilter((f) => ({
                    ...f,
                    brand: f.brand.includes(brand.name)
                      ? f.brand.filter((b) => b !== brand.name)
                      : [...f.brand, brand.name],
                  }))
                }
              />
              {brand.logo && (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="brand-logo-small"
                />
              )}
              <span>{brand.name}</span>
            </label>
          ))
        )}
      </div>

      {/* Product Status Filter */}
      <div className="filter-section">
        <h3>Product Status</h3>
        {statusOptions.map((status) => (
          <label key={status} className="brand-option">
            <input
              type="checkbox"
              checked={safeFilter.status.includes(status)}
              onChange={() =>
                setFilter((f) => ({
                  ...f,
                  status: f.status.includes(status)
                    ? f.status.filter((s) => s !== status)
                    : [...f.status, status],
                }))
              }
            />
            <span>{status}</span>
          </label>
        ))}
      </div>
    </aside>
  );
};

export default FilterSidebar;
