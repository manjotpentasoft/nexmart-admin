import AdminSidebar from "../../components/AdminSidebar";
import { useSidebar } from "../../contexts/SidebarContext";

export default function NotificationsPage() {
  const { isSidebarOpen } = useSidebar();

  const notifications = [
    { id: 1, message: "New order received", time: "2 min ago" },
    { id: 2, message: "Product out of stock", time: "1 hour ago" },
    { id: 3, message: "Customer inquiry", time: "3 hours ago" },
    { id: 4, message: "New customer registered", time: "6 hours ago" },
    { id: 5, message: "Weekly sales report ready", time: "1 day ago" },
    { id: 6, message: "Order #1234 shipped", time: "1 day ago" },
    { id: 7, message: 'Product "Wireless Mouse" is out of stock.', time: "1 day ago" },
    { id: 8, message: "Review submitted for product 'Laptop", time: "1 day ago" },
    { id: 9, message: "New order received", time: "2 days ago" },
    { id: 10, message: "Shirts out of stock", time: "2 days ago" },
  ];

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />
      <main
        className={`admin-dashboard-main ${
          !isSidebarOpen ? "sidebar-closed" : ""
        }`}
      >
        <header className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>Manage and view all notifications.</p>
          </div>
        </header>
        <section className="notifications-section">
          {notifications.map((notification) => (
            <div className="notifications-list">
              <div className="notification-item" key={notification.id}>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
