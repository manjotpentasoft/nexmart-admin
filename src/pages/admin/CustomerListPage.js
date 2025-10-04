import React, { useState, useEffect } from "react";
import { FaEye, 
  // FaTrash
 } from "react-icons/fa";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/OrdersPage.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const CustomersListPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const customerMap = new Map();

        snapshot.docs.forEach((docSnap) => {
          const order = docSnap.data();
          const shipping = order.shipping || {};
          const email = (shipping.email || "").toLowerCase();
          if (!email) return;

          if (!customerMap.has(email)) {
            customerMap.set(email, {
              name: shipping.name || "Unknown",
              email,
              phone: shipping.phone || "-",
            });
          }
        });

        setCustomers(Array.from(customerMap.values()));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter by search
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>Customers List</h1>
          <p>View customers here.</p>
        </div>
        <div className="search-area">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-table-section">
        {loading ? (
          <div className="loader"></div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.length > 0 ? (
                currentCustomers.map((c) => (
                  <tr key={c.email}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td className="actions">
                      <button
                        className="view"
                        onClick={() => navigate(`/admin/customers/${c.email}`)}
                      >
                        <FaEye />
                      </button>
                      {/* <button
                        className="delete"
                        // onClick={() => handleDeleteCustomer(c.id)}
                      >
                        <FaTrash />
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomersListPage;
