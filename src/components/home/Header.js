// Header.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  FaHeadphones,
  FaSearch,
  FaShoppingCart,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { subscribeToCollection } from "../../firebase/firestoreService";
import { subscribeToCart } from "../../firebase/cartService";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Header = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({
    left: "0px",
    top: "0px",
  });

  // ✅ Firebase Subscriptions
  useEffect(() => {
    const auth = getAuth();
    let unsubscribeCart = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.uid) {
        unsubscribeCart();
        unsubscribeCart = subscribeToCart(user.uid, setCartItems);
      } else {
        setCartItems([]);
        unsubscribeCart();
      }
    });

    const unsubProducts = subscribeToCollection("products", setProducts);
    const unsubCategories = subscribeToCollection("categories", setCategories);

    return () => {
      unsubscribeAuth();
      unsubscribeCart();
      unsubProducts();
      unsubCategories();
    };
  }, []);

  // ✅ Search filtering (intact)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      setShowSearchDropdown(false);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = products
      .filter((p) => {
        const matchesName = (p.name || "").toLowerCase().includes(term);
        const matchesCategory =
          !selectedCategory ||
          (p.category &&
            p.category.toLowerCase() === selectedCategory.toLowerCase());
        return matchesName && matchesCategory;
      })
      .slice(0, 8);

    setFilteredProducts(filtered);
    setShowSearchDropdown(true);
  }, [searchTerm, products, selectedCategory]);

  // ✅ Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle dropdown open/close and positioning
  const openDropdown = () => {
    clearTimeout(hoverTimeoutRef.current);
    setDropdownOpen(true);
  };

  const closeDropdownWithDelay = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setDropdownOpen(false), 160);
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const ddWidth = dropdownRef.current
        ? dropdownRef.current.offsetWidth
        : 360;
      let left = rect.left + window.scrollX;
      const maxLeft = window.innerWidth - ddWidth - 12;
      if (left > maxLeft) left = Math.max(12, maxLeft);
      const top = rect.bottom + window.scrollY + 8;
      setDropdownStyle({ left: `${left}px`, top: `${top}px` });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [dropdownOpen]);

  // ✅ Navigate when a category is clicked
  const handleCategoryClick = (categoryId) => {
    setDropdownOpen(false);
    navigate(`/category/${categoryId}`);
  };

  // ✅ Recursive Submenu Rendering
  const renderSubMenu = (items) => (
    <ul className="dropdown-submenu">
      {items.map((item) => (
        <li key={item.id}>
          <span
            className="submenu-item"
            onClick={() => handleCategoryClick(item.id)}
            style={{ cursor: "pointer" }}
          >
            {item.name}
          </span>
          {item.subcategories?.length > 0 && renderSubMenu(item.subcategories)}
        </li>
      ))}
    </ul>
  );

  // ✅ Product search click
  const handleProductClick = (id) => {
    setSearchTerm("");
    setShowSearchDropdown(false);
    navigate(`/product/view/${id}`);
  };

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <header className="header-bar">
        <div className="logo" onClick={() => navigate("/")}>
          <img src="./assets/images/logo-light.png" alt="Logo" />
        </div>

        {/* ---------- Search Bar ---------- */}
        <div className="search-bar" ref={searchRef}>
          <select
            className="search-category"
            aria-label="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search products, brands, and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowSearchDropdown(true)}
            aria-label="search"
          />

          <button
            className="search-btn"
            aria-label="search-button"
            onClick={() => {
              if (searchTerm.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
              }
            }}
          >
            <FaSearch size={22} />
          </button>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div
              className="search-dropdown"
              role="listbox"
              aria-label="search-results"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="search-result-item"
                    onClick={() => handleProductClick(product.id)}
                    role="option"
                  >
                    <img
                      src={
                        product.image ||
                        (Array.isArray(product.images) && product.images[0]) ||
                        "/placeholder.png"
                      }
                      alt={product.name}
                      className="search-result-thumb"
                    />
                    <div className="search-result-info">
                      <span className="name">{product.name}</span>
                      <span className="price">₹{product.price ?? "0.00"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-dropdown empty">No products found</div>
              )}
            </div>
          )}
        </div>

        {/* Hotline */}
        <div className="header-side">
          <span className="lang">EN</span>
          <span className="hotline" title="Hotline">
            <FaHeadphones size={32} />
            <span className="call">
              91 2345 678
              <br />
              <small>Call our Hotline 24/7</small>
            </span>
          </span>
        </div>

        {/* Mobile Icons */}
        <div className="mobile-icons">
          <Link className="cart-icon-mobile" to="/cart">
            <FaShoppingCart />
          </Link>
          <Link className="cart-icon-mobile" to="/account">
            <FaUser />
          </Link>
          <button
            className="hamburger-menu-mobile"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            <GiHamburgerMenu />
          </button>
        </div>
      </header>

      {/* ---------- NAVBAR ---------- */}
      <nav className="navbar">
        <div
          className="all-categories"
          ref={buttonRef}
          onMouseEnter={openDropdown}
          onMouseLeave={closeDropdownWithDelay}
        >
          <GiHamburgerMenu /> All Categories
        </div>

        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="navbar-actions">
          <Link className="cart" to="/cart">
            <FaShoppingCart />
          </Link>
          <Link className="cart" to="/account">
            <FaUser />
          </Link>
        </div>
      </nav>

      {/* ---------- MOBILE SIDEBAR ---------- */}
      <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </div>
        <ul>
          <li>
            <Link to="/" onClick={() => setSidebarOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/shop" onClick={() => setSidebarOpen(false)}>
              Shop
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setSidebarOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setSidebarOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* ---------- CATEGORIES DROPDOWN ---------- */}
      {dropdownOpen && (
        <>
          <div className="categories-dropdown-overlay" aria-hidden="true" />
          <div
            className="categories-dropdown"
            ref={dropdownRef}
            style={{ left: dropdownStyle.left, top: dropdownStyle.top }}
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdownWithDelay}
          >
            <div className="dropdown-inner">
              {categories.length === 0 ? (
                <div className="dropdown-empty">No categories</div>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="dropdown-category">
                    <span
                      className="dropdown-title"
                      onClick={() => handleCategoryClick(cat.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {cat.name}
                    </span>
                    {cat.subcategories?.length > 0 &&
                      renderSubMenu(cat.subcategories)}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
