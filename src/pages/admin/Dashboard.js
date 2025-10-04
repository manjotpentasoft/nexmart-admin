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
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import dayjs from "dayjs";

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
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    canceledOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalReviews: 0,
    totalTransactions: 0,
    totalTickets: 0,
    pendingTickets: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    thisMonthEarnings: 0,
    thisYearEarnings: 0,
  });

  // --- Fetch Orders ---
  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          customerName: data.shipping?.name || "N/A",
          orderId: doc.id,
          paymentMethod:
            data.paymentMethod || data.items?.[0]?.paymentMethod || "N/A",
          total: data.totalAmount || 0,
          orderStatus: data.orderStatus || "Pending",
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      setOrders(ordersData);

      // Update summary counts
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(
        (o) => o.orderStatus.toLowerCase() === "pending"
      ).length;
      const deliveredOrders = ordersData.filter(
        (o) => o.orderStatus.toLowerCase() === "delivered"
      ).length;
      const canceledOrders = ordersData.filter(
        (o) => o.orderStatus.toLowerCase() === "canceled"
      ).length;
      const totalEarnings = ordersData.reduce(
        (sum, o) => sum + (o.total || 0),
        0
      );

      const uniqueCustomers = new Set(ordersData.map((o) => o.customerName));

      // const startOfToday = dayjs().startOf("day");
      // const endOfToday = dayjs().endOf("day");

      // const todayEarnings = ordersData
      //   .filter(
      //     (o) =>
      //       dayjs(o.createdAt).isAfter(startOfToday) &&
      //       dayjs(o.createdAt).isBefore(endOfToday)
      //   )
      //   .reduce((sum, o) => sum + o.total, 0);

      // Month and year earnings
      const thisMonthEarnings = ordersData
        .filter((o) => dayjs(o.createdAt).isSame(dayjs(), "month"))
        .reduce((sum, o) => sum + o.total, 0);

      const thisYearEarnings = ordersData
        .filter((o) => dayjs(o.createdAt).isSame(dayjs(), "year"))
        .reduce((sum, o) => sum + o.total, 0);

      setSummary((prev) => ({
        ...prev,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        canceledOrders,
        totalEarnings,
        // todayEarnings,
        thisMonthEarnings,
        thisYearEarnings,
        totalCustomers: uniqueCustomers.size,
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const collections = [
        "products",
        "categories",
        "customers",
        "brands",
        "reviews",
        "transactions",
        "tickets",
      ];
      const snapshots = await Promise.all(
        collections.map((c) => getDocs(collection(db, c)))
      );
      setSummary((prev) => ({
        ...prev,
        totalProducts: snapshots[0].size,
        totalCategories: snapshots[1].size,
        totalCustomers: snapshots[2].size,
        totalBrands: snapshots[3].size,
        totalReviews: snapshots[4].size,
        totalTransactions: snapshots[5].size,
        totalTickets: snapshots[6].size,
        pendingTickets: snapshots[6].docs.filter(
          (t) => t.data().status === "pending"
        ).length,
      }));
    };
    fetchCounts();
  }, []);

  // --- Sales Chart Data (Last 30 Days) ---
  const last30Days = Array.from({ length: 30 }).map((_, i) =>
    dayjs()
      .subtract(29 - i, "day")
      .format("DD MMM")
  );
  const salesTotals = last30Days.map((day) =>
    orders
      .filter((o) => dayjs(o.createdAt).format("DD MMM") === day)
      .reduce((sum, o) => sum + o.total, 0)
  );

  const salesData = {
    labels: last30Days,
    datasets: [
      {
        label: "Sales ($)",
        data: salesTotals,
        borderColor: "#007bff",
        backgroundColor: "#007bff",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const summaryCards = [
    {
      title: "Total Orders",
      value: summary.totalOrders,
      icon: <FiShoppingCart />,
    },
    {
      title: "Pending Orders",
      value: summary.pendingOrders,
      icon: <FaClipboardList />,
    },
    {
      title: "Delivered Orders",
      value: summary.deliveredOrders,
      icon: <FiShoppingCart />,
    },
    {
      title: "Canceled Orders",
      value: summary.canceledOrders,
      icon: <FiShoppingCart />,
    },
    { title: "Total Products", value: summary.totalProducts, icon: <FiBox /> },
    {
      title: "Total Customers",
      value: summary.totalCustomers,
      icon: <FiUsers />,
    },
    {
      title: "Total Categories",
      value: summary.totalCategories,
      icon: <FiTag />,
    },
    { title: "Total Brands", value: summary.totalBrands, icon: <FiTag /> },
    // {
    //   title: "Total Reviews",
    //   value: summary.totalReviews,
    //   icon: <FaClipboardList />,
    // },
    // {
    //   title: "Total Transactions",
    //   value: summary.totalTransactions,
    //   icon: <FaClipboardList />,
    // },
    // {
    //   title: "Total Tickets",
    //   value: summary.totalTickets,
    //   icon: <FaClipboardList />,
    // },
    // {
    //   title: "Pending Tickets",
    //   value: summary.pendingTickets,
    //   icon: <FaClipboardList />,
    // },
    {
      title: "Total Earnings",
      value: `$${summary.totalEarnings.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
    },
    // {
    //   title: "Today Earnings",
    //   value: `$${summary.todayEarnings.toLocaleString()}`,
    //   icon: <FaMoneyBillWave />,
    // },
    {
      title: "This Month Earnings",
      value: `$${summary.thisMonthEarnings.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
    },
    {
      title: "This Year Earnings",
      value: `$${summary.thisYearEarnings.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
    },
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

      {/* Summary Cards */}
      <section className="admin-dashboard-section">
        <div className="admin-dashboard-cards">
          {summaryCards.map((card, idx) => (
            <div className="admin-dashboard-card summary-card" key={idx}>
              <span
                className="admin-dashboard-icon"
                style={{ fontSize: "2rem", marginRight: "18px" }}
              >
                {card.icon}
              </span>
              <div className="summary-card-content">
                <h2>{card.title}</h2>
                <div className="summary-card-value">{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sales Chart */}
      <section className="admin-dashboard-charts">
        <div className="chart-card">
          <h2>Sales in Last 30 Days</h2>
          <Line data={salesData} />
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
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>{order.customerName}</td>
                  <td className="order-link">{order.orderId}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.orderStatus}</td>
                  <td>${order.total.toLocaleString()}</td>
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
//         { title: "Total Earning", value: `$${userData?.totalEarnings?.toLocaleString() || 0}`, iconClass: <FaMoneyBillWave /> },
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
//                   <td>${order.total?.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>
//     </AdminLayout>
//   );
// }
