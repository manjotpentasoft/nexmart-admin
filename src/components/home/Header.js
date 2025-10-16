import React, { useEffect, useState, useRef } from "react";
import {
  FaHeadphones,
  FaHeart,
  FaSearch,
  FaShoppingCart,
  FaTimes,
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
  const [dropdownStyle, setDropdownStyle] = useState({ left: 0, top: 0 });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // User-specific cart subscription
  useEffect(() => {
    const auth = getAuth();
    let unsubscribeCart = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.uid) {
        unsubscribeCart(); // cleanup previous subscription
        unsubscribeCart = subscribeToCart(user.uid, setCartItems);
      } else {
        setCartItems([]);
        unsubscribeCart();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCart();
    };
  }, []);

  // Firestore subscriptions for products & categories
  useEffect(() => {
    const unsubProducts = subscribeToCollection("products", setProducts);
    const unsubCategories = subscribeToCollection("categories", setCategories);

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  // Search filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      setShowSearchDropdown(false);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = products
      .filter((p) => (p.name || "").toLowerCase().includes(term))
      .slice(0, 8);
    setFilteredProducts(filtered);
    setShowSearchDropdown(true);
  }, [searchTerm, products]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Category dropdown hover
  const openDropdown = () => {
    clearTimeout(hoverTimeoutRef.current);
    setDropdownOpen(true);
  };
  const closeDropdownWithDelay = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setDropdownOpen(false), 160);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleDocClick = (e) => {
      if (
        dropdownOpen &&
        !buttonRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [dropdownOpen]);

  // Update dropdown position dynamically
  useEffect(() => {
    if (!dropdownOpen) return;
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const preferredLeft = rect.left + window.scrollX;
      const preferredTop = rect.bottom + window.scrollY + 8;
      const ddWidth = dropdownRef.current
        ? dropdownRef.current.offsetWidth
        : 360;
      let left = preferredLeft;
      const maxLeft = window.innerWidth - ddWidth - 12;
      if (left > maxLeft) left = Math.max(12, maxLeft);
      setDropdownStyle({ left: `${left}px`, top: `${preferredTop}px` });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [dropdownOpen]);

  // Recursive submenu renderer
  const renderSubMenu = (items) => (
    <ul className="dropdown-submenu">
      {items.map((item) => (
        <li key={item.id}>
          <span className="submenu-item">{item.name}</span>
          {item.subcategories?.length > 0 && renderSubMenu(item.subcategories)}
        </li>
      ))}
    </ul>
  );

  const handleCart = () => navigate("/cart");
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

        {/* Search Section */}
        <div className="search-section" ref={searchRef}>
          <select>
            <option>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowSearchDropdown(true)}
          />
          <button className="search-btn">
            <FaSearch />
          </button>

          {/* Search Dropdown */}
          {showSearchDropdown && filteredProducts.length > 0 && (
            <div className="search-dropdown">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => handleProductClick(product.id)}
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
                    <span className="price">₹{product.price || "0.00"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showSearchDropdown && filteredProducts.length === 0 && (
            <div className="search-dropdown empty">No products found</div>
          )}
        </div>

        {/* Hotline Section */}
        <div className="header-side">
          <span className="lang">EN</span>
          <span className="hotline">
            <FaHeadphones size={35} />
            <span className="call">
              91 2345 678
              <br />
              <small>Call our Hotline 24/7</small>
            </span>
          </span>
        </div>

        {/* Mobile Icons */}
        <div className="mobile-icons">
          <button onClick={() => navigate("/wishlist")} className="cart-icon-mobile">
            <FaHeart color="red" />
          </button>
          <Link className="cart-icon-mobile" to="/cart">
            <FaShoppingCart />
            {/* <sup>{cartItems.length}</sup> */}
          </Link>
          <button className="hamburger-menu-mobile" onClick={toggleSidebar}>
            <GiHamburgerMenu />
          </button>
        </div>
      </header>

      {/* ---------- DESKTOP NAVBAR ---------- */}
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
          <Link to="/wishlist" className="wishlist">
            <FaHeart />
          </Link>
          <Link className="cart" to="/cart">
            <FaShoppingCart />
            {/* <sup>{cartItems.length}</sup> */}
          </Link>
        </div>
      </nav>

      {/* ---------- MOBILE SIDEBAR ---------- */}
      <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </div>

        <ul>
          <li>
            <Link to="/" onClick={toggleSidebar}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/shop" onClick={toggleSidebar}>
              Shop
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={toggleSidebar}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={toggleSidebar}>
              Contact
            </Link>
          </li>
        </ul>

        <div className="sidebar-contact">
          <p>
            <strong>Contact Info</strong>
          </p>
          <p>57 Heol Isaf Station Road, Cardiff, UK</p>
          <p>91 2345 678</p>
          <p>info@example.com</p>
        </div>
      </div>

      {/* Dropdown Overlay */}
      {dropdownOpen && (
        <div
          className="categories-dropdown-overlay"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Categories Dropdown */}
      {dropdownOpen && (
        <div
          className="categories-dropdown"
          ref={dropdownRef}
          style={{
            left: dropdownStyle.left,
            top: dropdownStyle.top,
            zIndex: 3000,
          }}
          onMouseEnter={openDropdown}
          onMouseLeave={closeDropdownWithDelay}
        >
          <div className="dropdown-inner">
            {categories.length === 0 && (
              <div className="dropdown-empty">No categories</div>
            )}
            {categories.map((cat) => (
              <div key={cat.id} className="dropdown-category">
                <span className="dropdown-title">{cat.name}</span>
                {cat.subcategories?.length > 0 &&
                  renderSubMenu(cat.subcategories)}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
