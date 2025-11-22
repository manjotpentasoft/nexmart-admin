import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useSidebar } from "../contexts/SidebarContext";

const AdminLayout = ({ children }) => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div style={styles.dashboard}>
      <div
        style={{
          ...styles.sidebar,
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <AdminSidebar sidebarOpen={isSidebarOpen} />
      </div>

      <div style={styles.main(isSidebarOpen)}>
        <div style={styles.navbar}>
          <AdminNavbar />
        </div>
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;

const styles = {
  dashboard: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
  },
  main: (isSidebarOpen) => ({
    flex: 1,
    marginLeft: isSidebarOpen ? "240px" : "0",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    overflowX: "hidden",
  }),
  content: {
    flex: 1,
    padding: "20px",
    marginTop: "56px",
    boxSizing: "border-box",
  },
  navbar: {
    width: "100%",
    background: "linear-gradient(90deg, #27bda0 0%, #4299e1 100%)",
    color: "#fff",
    padding: "6px 12px",
    position: "fixed",
    top: 0,
    right: 0,
    zIndex: 1200,
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #27bda0 0%, #27b397 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    borderBottomRightRadius: "20px",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1100,
    transition: "transform 0.3s ease, width 0.3s ease",
    fontSize: "0.95rem",
    overflowY: "auto",
    scrollBehavior: "smooth",
    overflowX: "hidden",
    scrollbarWidth: "none",
  },
};
