import "../../styles/AdminDashboard.css";
import AdminLayout from "../../components/AdminLayout";
import { FiShoppingCart, FiBox, FiUsers, FiTag } from "react-icons/fi";
import { FaMoneyBillWave, FaClipboardList } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {

  const summary = [
    { title: "Total Orders", value: "222", iconClass: <FiShoppingCart /> },
    { title: "Pending Orders", value: "144", iconClass: <FaClipboardList /> },
    { title: "Delivered Orders", value: "55", iconClass: <FiShoppingCart /> },
    { title: "Canceled Orders", value: "2", iconClass: <FiShoppingCart /> },
    { title: "Total Product Sale", value: "74", iconClass: <FiBox /> },
    { title: "Today Product Order", value: "0", iconClass: <FiBox /> },
    { title: "This Month Sale", value: "3", iconClass: <FiBox /> },
    { title: "This Year Product Sale", value: "68", iconClass: <FiBox /> },
    { title: "Total Earning", value: "₦21,459,756.88", iconClass: <FaMoneyBillWave /> },
    { title: "Today Pending Earning", value: "₦0", iconClass: <FaMoneyBillWave /> },
    { title: "This Month Earning", value: "₦1,286,954.72", iconClass: <FaMoneyBillWave /> },
    { title: "This Year Earning", value: "₦20,392,871.37", iconClass: <FaMoneyBillWave /> },
    { title: "Total Products", value: "47", iconClass: <FiBox /> },
    { title: "Total Customers", value: "79", iconClass: <FiUsers /> },
    { title: "Total Categories", value: "9", iconClass: <FiTag /> },
    { title: "Total Brands", value: "9", iconClass: <FiTag /> },
    { title: "Total Reviews", value: "2", iconClass: <FaClipboardList /> },
    { title: "Total Transactions", value: "211", iconClass: <FaClipboardList /> },
    { title: "Total Tickets", value: "3", iconClass: <FaClipboardList /> },
    { title: "Pending Tickets", value: "0", iconClass: <FaClipboardList /> },
  ];

//   const extraSummary = [
//     { title: "Open Tickets", value: "3", iconClass: <FaClipboardList /> },
//     { title: "Total Blogs", value: "8", iconClass: <FaClipboardList /> },
//     { title: "Total Subscribers", value: "56", iconClass: <FiUsers /> },
//     { title: "Total System User", value: "1", iconClass: <FiUsers /> },
//   ];

  // Chart Data
  const salesData = {
    labels: ["16 Sep", "13 Sep", "10 Sep", "07 Sep", "04 Sep", "01 Sep", "26 Aug", "23 Aug", "20 Aug", "18 Aug"],
    datasets: [
      {
        label: "Sales",
        data: [0, 1, 1, 0, 0, 1, 1, 2, 0, 1],
        borderColor: "#007bff",
        backgroundColor: "#007bff",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const earningsData = {
    labels: ["16 Sep", "13 Sep", "10 Sep", "07 Sep", "04 Sep", "01 Sep", "26 Aug", "23 Aug", "20 Aug", "18 Aug"],
    datasets: [
      {
        label: "Earnings",
        data: [0, 500000, 200000, 0, 0, 1000000, 1500000, 2500000, 2000000, 2700000],
        borderColor: "#dc3545",
        backgroundColor: "#dc3545",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const orders = [
    { customer: "John Doe", orderId: "ORD-20250915-345", method: "Cash On Delivery", total: "$4,766.28" },
    { customer: "Jane Smith", orderId: "ORD-20250915-344", method: "Cash On Delivery", total: "$1,588.76" },
    { customer: "X X", orderId: "ORD-20250912-343", method: "Cash On Delivery", total: "$13,958.98" },
  ];

  return (
    <AdminLayout>
      <header className="admin-dashboard-header">
        <h1>Nexmart Admin Dashboard</h1>
        <p>
          Quick summary of your ecommerce platform. Manage orders, products,
          customers, transactions, and more efficiently.
        </p>
      </header>

      {/* Extra KPI Cards */}
      <section className="admin-dashboard-section">
        <div className="admin-dashboard-cards">
          {/* {extraSummary.map((card, idx) => (
            <div className="admin-dashboard-card summary-card" key={idx}>
              <span className="admin-dashboard-icon" style={{ fontSize: "2rem", marginRight: "18px" }}>
                {card.iconClass}
              </span>
              <div className="summary-card-content">
                <h2>{card.title}</h2>
                <div className="summary-card-value">{card.value}</div>
              </div>
            </div>
          ))} */}
        </div>
      </section>

      {/* Main Summary Cards */}
      <section className="admin-dashboard-section">
        <div className="admin-dashboard-cards">
          {summary.map((card, idx) => (
            <div className="admin-dashboard-card summary-card" key={idx}>
              <span className="admin-dashboard-icon" style={{ fontSize: "2rem", marginRight: "18px" }}>
                {card.iconClass}
              </span>
              <div className="summary-card-content">
                <h2>{card.title}</h2>
                <div className="summary-card-value">{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="admin-dashboard-charts">
        <div className="chart-card">
          <h2>Monthly Product Sales Report</h2>
          <Line data={salesData} />
        </div>
        <div className="chart-card">
          <h2>Monthly Earnings Report</h2>
          <Line data={earningsData} />
        </div>
      </section>

      {/* Recent Orders */}
      <section className="admin-dashboard-section">
        <h2>Recent Orders</h2>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Payment Method</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={idx}>
                  <td>{order.customer}</td>
                  <td className="order-link">{order.orderId}</td>
                  <td>{order.method}</td>
                  <td>{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

// import "../../styles/AdminDashboard.css";
// import AdminLayout from "../../components/AdminLayout";
// import { FiShoppingCart, FiBox, FiUsers, FiTag } from "react-icons/fi";
// import { FaMoneyBillWave, FaClipboardList } from "react-icons/fa";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { useEffect, useState } from "react";
// import { listenToUser } from "../../firebase/authConfig";
// import { auth, db } from "../../firebase/firebaseConfig";
// import { collection, query, onSnapshot } from "firebase/firestore";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function AdminDashboard() {
//   const [userData, setUserData] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [summary, setSummary] = useState([]);

//   // Listen to currently logged-in admin/user
//   useEffect(() => {
//     if (auth.currentUser) {
//       const unsubscribeUser = listenToUser(auth.currentUser.uid, (data) => {
//         setUserData(data);
//       });

//       // Listen to orders collection in real-time
//       const ordersQuery = query(collection(db, "orders"));
//       const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
//         const ordersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//         setOrders(ordersList);
//       });

//       return () => {
//         unsubscribeUser();
//         unsubscribeOrders();
//       };
//     }
//   }, []);

//   // Build summary dynamically from Firestore data
//   useEffect(() => {
//     if (userData) {
//       setSummary([
//         { title: "Total Orders", value: orders.length, iconClass: <FiShoppingCart /> },
//         { title: "Pending Orders", value: orders.filter(o => o.status === "pending").length, iconClass: <FaClipboardList /> },
//         { title: "Delivered Orders", value: orders.filter(o => o.status === "delivered").length, iconClass: <FiShoppingCart /> },
//         { title: "Canceled Orders", value: orders.filter(o => o.status === "canceled").length, iconClass: <FiShoppingCart /> },
//         { title: "Total Products", value: userData?.totalProducts || 0, iconClass: <FiBox /> },
//         { title: "Total Customers", value: userData?.totalCustomers || 0, iconClass: <FiUsers /> },
//         { title: "Total Categories", value: userData?.totalCategories || 0, iconClass: <FiTag /> },
//         { title: "Total Brands", value: userData?.totalBrands || 0, iconClass: <FiTag /> },
//         { title: "Total Earning", value: `₦${userData?.totalEarnings?.toLocaleString() || 0}`, iconClass: <FaMoneyBillWave /> },
//       ]);
//     }
//   }, [userData, orders]);

//   // Chart Data Example (you can compute dynamically too)
//   const salesData = {
//     labels: orders.map((o) => o.date || "N/A").slice(-10),
//     datasets: [
//       {
//         label: "Sales",
//         data: orders.map((o) => o.total || 0).slice(-10),
//         borderColor: "#007bff",
//         backgroundColor: "#007bff",
//         tension: 0.4,
//         fill: false,
//       },
//     ],
//   };

//   const earningsData = {
//     labels: orders.map((o) => o.date || "N/A").slice(-10),
//     datasets: [
//       {
//         label: "Earnings",
//         data: orders.map((o) => o.total || 0).slice(-10),
//         borderColor: "#dc3545",
//         backgroundColor: "#dc3545",
//         tension: 0.4,
//         fill: false,
//       },
//     ],
//   };

//   return (
//     <AdminLayout>
//       <header className="admin-dashboard-header">
//         <h1>Nexmart Admin Dashboard</h1>
//         <p>Quick summary of your ecommerce platform. Manage orders, products, customers, transactions, and more efficiently.</p>
//       </header>

//       {/* Summary Cards */}
//       <section className="admin-dashboard-section">
//         <div className="admin-dashboard-cards">
//           {summary.map((card, idx) => (
//             <div className="admin-dashboard-card summary-card" key={idx}>
//               <span className="admin-dashboard-icon" style={{ fontSize: "2rem", marginRight: "18px" }}>
//                 {card.iconClass}
//               </span>
//               <div className="summary-card-content">
//                 <h2>{card.title}</h2>
//                 <div className="summary-card-value">{card.value}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Charts */}
//       <section className="admin-dashboard-charts">
//         <div className="chart-card">
//           <h2>Monthly Product Sales Report</h2>
//           <Line data={salesData} />
//         </div>
//         <div className="chart-card">
//           <h2>Monthly Earnings Report</h2>
//           <Line data={earningsData} />
//         </div>
//       </section>

//       {/* Recent Orders */}
//       <section className="admin-dashboard-section">
//         <h2>Recent Orders</h2>
//         <div className="orders-table-wrapper">
//           <table className="orders-table">
//             <thead>
//               <tr>
//                 <th>Customer</th>
//                 <th>Order ID</th>
//                 <th>Payment Method</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.slice(-5).map((order, idx) => (
//                 <tr key={idx}>
//                   <td>{order.customerName}</td>
//                   <td className="order-link">{order.orderId}</td>
//                   <td>{order.paymentMethod}</td>
//                   <td>₦{order.total?.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>
//     </AdminLayout>
//   );
// }
