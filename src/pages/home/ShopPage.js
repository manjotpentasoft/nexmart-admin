import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import FilterSidebar from "../../components/home/FilterShopSidebar";
import "../../styles/home/ShopPage.css";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import HighlightsSection from "../../components/home/HighlightSection";

const ShopPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    price: [130, 500],
    brand: [],
    category: [],
    status: [],
    sort: "none",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false); // mobile toggle
  const productsPerPage = 12;

  useEffect(() => {
    setLoading(true);
    const qBase = query(
      collection(db, "products"),
      where("price", ">=", filter.price[0]),
      where("price", "<=", filter.price[1])
    );

    const unsubscribe = onSnapshot(
      qBase,
      (snapshot) => {
        let productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // LOCAL FILTERS
        if (filter.brand.length > 0) {
          productList = productList.filter((p) =>
            filter.brand.includes(p.brand)
          );
        }

        if (filter.category.length > 0) {
          productList = productList.filter(
            (p) =>
              filter.category.includes(p.category) ||
              (p.categories &&
                p.categories.some((c) => filter.category.includes(c)))
          );
        }

        if (filter.status.length > 0) {
          productList = productList.filter((p) => {
            const status = p.stock > 0 ? "In Stock" : "Out of Stock";
            return filter.status.includes(status);
          });
        }

        // SORT
        if (filter.sort === "priceLowHigh")
          productList.sort((a, b) => a.price - b.price);
        else if (filter.sort === "priceHighLow")
          productList.sort((a, b) => b.price - a.price);
        else if (filter.sort === "nameAZ")
          productList.sort((a, b) => a.name.localeCompare(b.name));

        setProducts(productList);
        setCurrentPage(1);
        setLoading(false); // always false, even if empty
      },
      (err) => {
        console.error(err);
        setProducts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filter]);

  const openProductView = (productId) => navigate(`/product/view/${productId}`);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <div className="shopnow-layout">
        {/* Mobile Filter Toggle */}
        <button
          className="mobile-filter-toggle"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filter Sidebar */}
        <FilterSidebar
          filter={filter}
          setFilter={setFilter}
          className={showFilters ? "active" : ""}
        />

        {/* Product Grid */}
        <div className="shopnow-container">
          <div className="shop-header">
            <h1 className="shopnow-title">Shop Now</h1>
            <div className="sort-dropdown">
              <label>Sort By:</label>
              <select
                value={filter.sort}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, sort: e.target.value }))
                }
              >
                <option value="none">None</option>
                <option value="priceLowHigh">Price: Low–High</option>
                <option value="priceHighLow">Price: High–Low</option>
                <option value="nameAZ">A–Z</option>
              </select>
            </div>
          </div>

          <div className="shopnow-grid">
            {loading ? (
              <div className="loader"></div>
            ) : currentProducts.length === 0 ? (
              <div className="no-products">No products found.</div>
            ) : (
              currentProducts.map((item) => (
                <div
                  key={item.id}
                  className="product-card"
                  onClick={() => openProductView(item.id)}
                >
                  <img
                    src={item.image || "/assets/placeholder.png"}
                    alt={item.name}
                    className="product-img"
                  />
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-desc">{item.description}</p>
                  <p className="product-price">₹ {item.price}</p>
                  <p className="product-brand">{item.brand}</p>
                  <p className="product-category">{item.category}</p>
                  <p
                    className={`product-status ${
                      item.stock > 0 ? "InStock" : "OutOfStock"
                    }`}
                  >
                    {item.stock > 0 ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              ))
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? "active-page" : ""}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <HighlightsSection />
      <Footer />
    </>
  );
};

export default ShopPage;
