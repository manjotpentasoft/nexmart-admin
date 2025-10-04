import React, { useState, useEffect } from "react";
import "../../styles/OrdersPage.css";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false); // stop loader once fetch is done
      }
    };
    fetchOrders();
  }, []);

  // Filtering
  useEffect(() => {
    let filtered = [...orders];

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Payment status filter
    if (paymentFilter) {
      filtered = filtered.filter((order) =>
        paymentFilter === "Paid"
          ? order.paymentStatus === "Paid"
          : order.paymentStatus === "Pending"
      );
    }

    // Order status filter
    if (orderStatusFilter) {
      filtered = filtered.filter(
        (order) =>
          order.orderStatus?.toLowerCase() === orderStatusFilter.toLowerCase()
      );
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.user?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [
    orders,
    searchTerm,
    startDate,
    endDate,
    paymentFilter,
    orderStatusFilter,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages, currentPage]);
  const currentData = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Modals
  const handleView = (order) => {
    navigate(`/admin/orders/invoice/${order.id}`);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
  };

  // Edit / Delete
  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };
  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setFilteredOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };
  // Edit / Save with stock updates
  const handleSaveEdit = async () => {
    if (!selectedOrder) return;

    try {
      const orderRef = doc(db, "orders", selectedOrder.id);

      // Fetch previous order status to compare
      const prevOrder = orders.find((o) => o.id === selectedOrder.id);
      const prevStatus = prevOrder?.orderStatus;

      // Determine stock change
      const shouldDecreaseStock =
        selectedOrder.orderStatus === "Delivered" && prevStatus !== "Delivered";
      const shouldIncreaseStock =
        selectedOrder.orderStatus !== "Delivered" && prevStatus === "Delivered";

      // Update product stock if needed
      if (shouldDecreaseStock || shouldIncreaseStock) {
        const productUpdates =
          selectedOrder.products?.map(async (product) => {
            const productRef = doc(db, "products", product.id);
            await updateDoc(productRef, {
              stock: shouldDecreaseStock
                ? increment(-product.quantity)
                : increment(product.quantity),
            });
          }) || [];

        await Promise.all(productUpdates);
      }

      // Update order in Firestore
      await updateDoc(orderRef, {
        orderStatus: selectedOrder.orderStatus,
        paymentStatus: selectedOrder.paymentStatus,
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? selectedOrder : o))
      );
      setFilteredOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? selectedOrder : o))
      );

      closeEditModal();
    } catch (err) {
      console.error("Error saving order:", err);
    }
  };

  // Update stock and order status for a single order
  const handleToggleDelivered = async (order, checked) => {
    const orderRef = doc(db, "orders", order.id);

    const productUpdates =
      order.products?.map(async (product) => {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, {
          stock: checked
            ? increment(-product.quantity)
            : increment(product.quantity),
        });
      }) || [];

    await Promise.all(productUpdates);
    await updateDoc(orderRef, {
      orderStatus: checked ? "Delivered" : "Pending",
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, orderStatus: checked ? "Delivered" : "Pending" }
          : o
      )
    );
    setFilteredOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, orderStatus: checked ? "Delivered" : "Pending" }
          : o
      )
    );
  };

  // Bulk update for current page only
  const handleBulkDeliveredOnPage = async (checked) => {
    const updates = currentData.map(async (order) => {
      const orderRef = doc(db, "orders", order.id);

      const productUpdates =
        order.products?.map(async (product) => {
          const productRef = doc(db, "products", product.id);
          await updateDoc(productRef, {
            stock: checked
              ? increment(-product.quantity)
              : increment(product.quantity),
          });
        }) || [];

      await Promise.all(productUpdates);
      await updateDoc(orderRef, {
        orderStatus: checked ? "Delivered" : "Pending",
      });
    });

    await Promise.all(updates);

    setOrders((prev) =>
      prev.map((o) =>
        currentData.some((cd) => cd.id === o.id)
          ? { ...o, orderStatus: checked ? "Delivered" : "Pending" }
          : o
      )
    );

    setFilteredOrders((prev) =>
      prev.map((o) =>
        currentData.some((cd) => cd.id === o.id)
          ? { ...o, orderStatus: checked ? "Delivered" : "Pending" }
          : o
      )
    );
  };

  return (
    <AdminLayout>
      <div className="orders-header">
        <div className="orders-title">
          <h1>All Orders</h1>
          <p>Manage and view all orders here.</p>
        </div>
        <div className="orders-search">
          <input
            type="text"
            placeholder="Search by ID or User"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-filters">
        <h3>Filter Orders</h3>
        <div className="date-filters">
          <div className="date-filter">
            <p>Start Date</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-filter">
            <p>End Date</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="date-filter">
            <p>Payment Status</p>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Unpaid</option>
            </select>
          </div>
          <div className="date-filter">
            <p>Order Status</p>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Progress">In Progress</option>
              <option value="Delivered">Delivered</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="orders-table-section">
        {loading ? (
          <div className="loader"></div>
        ) : currentData.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={currentData.every(
                      (o) => o.orderStatus === "Delivered"
                    )}
                    onChange={(e) =>
                      handleBulkDeliveredOnPage(e.target.checked)
                    }
                  />
                </th>
                <th>Order ID</th>
                <th>User</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((order) => {
                const isPaid = order.paymentStatus === "Paid";
                const orderStatus = isPaid ? "Delivered" : order.orderStatus;

                return (
                  <tr key={order.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isPaid || orderStatus === "Delivered"}
                        disabled={isPaid}
                        onChange={(e) =>
                          handleToggleDelivered(order, e.target.checked)
                        }
                      />
                    </td>
                    <td>{order.id}</td>
                    <td>{order.user}</td>
                    <td>${order.totalAmount?.toLocaleString() || 0}</td>
                    <td>
                      <span
                        className={`order-status ${isPaid ? "paid" : "unpaid"}`}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`order-status-badge ${orderStatus
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {orderStatus}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn view"
                        onClick={() => handleView(order)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn edit"
                        onClick={() => handleEdit(order)}
                        disabled={isPaid}
                        title={
                          isPaid || orderStatus === "Delivered"
                            ? "Delivered orders cannot be edited"
                            : ""
                        }
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn delete"
                        onClick={() => handleDelete(order.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Order</h2>
            <label>
              Order Status:
              <select
                value={selectedOrder.orderStatus || "Pending"}
                onChange={(e) =>
                  setSelectedOrder({
                    ...selectedOrder,
                    orderStatus: e.target.value,
                  })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Progress">In Progress</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
              </select>
            </label>

            <label>
              Payment Status:
              <select
                value={selectedOrder.paymentStatus || "Pending"}
                disabled={selectedOrder.paymentStatus === "Paid"}
                onChange={(e) =>
                  setSelectedOrder({
                    ...selectedOrder,
                    paymentStatus:
                      e.target.value === "Unpaid" ? "Pending" : e.target.value,
                  })
                }
              >
                <option value="Pending">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </label>

            <div className="modal-buttons">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default OrdersPage;
