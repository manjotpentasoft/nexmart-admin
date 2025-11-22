import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { subscribeToCollection } from "../../firebase/firestoreService";
import Header from "../../components/home/Header";
import HighlightsSection from "../../components/home/HighlightSection";
import Footer from "../../components/home/Footer";
import "../../styles/home/ShopPage.css"; // reuse ShopPage styles

const CategoryPage = () => {
  const { id } = useParams(); // category doc ID
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("Category Products");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    setLoading(true);

    let unsubscribeProducts = null;

    // First, get categories to find the name
    const unsubscribeCategories = subscribeToCollection(
      "categories",
      (allCategories) => {
        const category = allCategories.find((cat) => cat.id === id);

        if (!category) {
          setCategoryName("Category Products");
          setProducts([]);
          setLoading(false);
          return;
        }

        setCategoryName(category.name);

        // Now fetch products filtered by category name
        unsubscribeProducts = subscribeToCollection("products", (allProducts) => {
          const filtered = allProducts.filter(
            (p) => p.category === category.name
          );
          setProducts(filtered);
          setCurrentPage(1);
          setLoading(false);
        });
      }
    );

    return () => {
      unsubscribeCategories();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, [id]);

  const openProductView = (productId) => navigate(`/product/view/${productId}`);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <div className="shopnow-layout">
        <div className="shopnow-container">
          <div className="shop-header">
            <h1 className="shopnow-title">{categoryName}</h1>
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
                    src={
                      item.image ||
                      (Array.isArray(item.images) && item.images[0]) ||
                      "/assets/placeholder.png"
                    }
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

export default CategoryPage;
