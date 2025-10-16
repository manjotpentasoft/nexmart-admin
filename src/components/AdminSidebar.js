import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/AdminSidebar.css";
import {
  FaHome,
  FaUsers,
  FaFileAlt,
  FaUserCog,
  FaPhoneAlt,
} from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { AiFillProduct } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { useSidebar } from "../contexts/SidebarContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

const AdminSidebar = () => {
  const location = useLocation();
  const { isSidebarOpen } = useSidebar();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState({ name: "", email: "", image: null });

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUser({
          name: data.name || "No Name",
          email: data.email || "No Email",
          image: data.image || null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <div className={`admin-dashboard-sidebar ${isSidebarOpen ? "open" : ""}`}>
      <nav>
        {/* <div className="sidebar-profile">
          {user.image ? (
            <img src={user.image} alt="Profile" className="profile-image" />
          ) : (
            <FaUserCircle className="profile-image-icon" />
          )}
          <div className="profile-info">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
          </div>
        </div> */}

        <ul>
          {/* Dashboard */}
          <li className={location.pathname === "/admin" ? "active" : ""}>
            <Link to="/admin/dashboard">
              <FaHome /> Dashboard
            </Link>
          </li>

          {/* Categories */}
          <li onClick={() => toggleDropdown("categories")}>
            <span>
              <BiCategoryAlt /> Manage Categories{" "}
              {openDropdown === "categories" ? (
                <FiChevronDown />
              ) : (
                <FiChevronRight />
              )}
            </span>
          </li>
          {openDropdown === "categories" && (
            <ul>
              <li>
                <Link to="/admin/categories">Categories</Link>
              </li>
              <li>
                <Link to="/admin/subcategories">Sub Categories</Link>
              </li>
            </ul>
          )}

          {/* Products */}
          <li onClick={() => toggleDropdown("products")}>
            <span>
              <AiFillProduct /> Manage Products{" "}
              {openDropdown === "products" ? (
                <FiChevronDown />
              ) : (
                <FiChevronRight />
              )}
            </span>
          </li>
          {openDropdown === "products" && (
            <ul>
              <li>
                <Link to="/admin/brand">Brands</Link>
              </li>
              <li>
                <Link to="/admin/create">Add Product</Link>
              </li>
              <li>
                <Link to="/admin/products">All Products</Link>
              </li>
              <li>
                <Link to="/admin/stock/out/product">Stock Out Products</Link>
              </li>
            </ul>
          )}

          {/* Orders */}
          <li>
            <Link to="/admin/orders">
              <BsBoxSeam /> Manage Orders
            </Link>
          </li>

          {/* Customers */}
          <li>
            <Link to="/admin/customers">
              <FaUsers /> Customer List
            </Link>
          </li>

          {/* Manage Site */}
          <li onClick={() => toggleDropdown("site")}>
            <span>
              <FaUserCog /> Manage Site{" "}
              {openDropdown === "site" ? <FiChevronDown /> : <FiChevronRight />}
            </span>
          </li>
          {openDropdown === "site" && (
            <ul>
              {/* <li><Link to="/admin/home">Home Page</Link></li> */}
              <li>
                <Link to="/admin/sliders">Sliders</Link>
              </li>
              {/* <li><Link to="/admin/announcement">Announcement</Link></li> */}
              {/* <li><Link to="/admin/maintenance">Maintenance</Link></li> */}
            </ul>
          )}

          {/* Pages */}
          <li>
            <Link to="/admin/pages">
              <FaFileAlt /> Manage Pages
            </Link>
          </li>
          <li>
            <Link to="/admin/contacts">
              <FaPhoneAlt /> Contacts
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
