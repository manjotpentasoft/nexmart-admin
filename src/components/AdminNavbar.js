import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { useSidebar } from "../contexts/SidebarContext";
import "../styles/AdminNavbar.css";
import { db, auth } from "../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function AdminNavbar() {
  const { toggleSidebar, isSidebarOpen } = useSidebar();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", image: null });
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUser({
          name: data.name || "",
          email: data.email || "",
          image: data.image || null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <>
      <div className="navbar-left">
        <div className="sidebar-logo">
          {isSidebarOpen && (
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              Nexmart
            </Link>
          )}
        </div>
        <div className="hamburger-menu" onClick={toggleSidebar}>
          <GiHamburgerMenu />
        </div>
      </div>

      <div className="navbar-right">
        <div
          className="navbar-profile"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          {user.image ? (
            <img src={user.image} alt="Profile" className="profile-image" />
          ) : (
            <FaUserCircle className="navbar-profile-icon" />
          )}
          <span className="navbar-profile-name">{user.name}</span>

          {showProfileDropdown && (
            <div className="dropdown-menu profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="dropdown-profile-image"
                    />
                  ) : (
                    <FaUserCircle className="dropdown-profile-image" />
                  )}
                  <div className="dropdown-user-details">
                    <span className="dropdown-user-name">{user.name}</span>
                    <span className="dropdown-user-email">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <Link
                to="/admin/profile"
                className="dropdown-item"
                onClick={() => setShowProfileDropdown(false)}
              >
                Update Profile
              </Link>

              <Link
                to="/admin/change-password"
                className="dropdown-item"
                onClick={() => setShowProfileDropdown(false)}
              >
                Change Password
              </Link>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                Logout
              </button>

              <div className="dropdown-footer">
                <Link
                  to="/"
                  className="view-website-btn"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  View Website
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
