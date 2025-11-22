import React, { useState, useEffect, useMemo } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/OrdersPage.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  deleteOrder,
  updateOrder,
  toggleDeliveredStatus,
  bulkUpdateDelivered,
  fetchAllUserOrders,
} from "../../firebase/ordersService";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
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

  /** Fetch orders from service */
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await fetchAllUserOrders();
        setOrders(data);
      } catch (err) {
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  // helper: convert various createdAt shapes to a JS Date
  const parseOrderDate = (createdAt) => {
    if (!createdAt) return null;

    if (
      typeof createdAt === "object" &&
      typeof createdAt.toDate === "function"
    ) {
      return createdAt.toDate();
    }

    if (typeof createdAt === "number") {
      if (createdAt < 1e12) return new Date(createdAt * 1000);
      return new Date(createdAt);
    }

    if (typeof createdAt === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(createdAt)) {
        const [y, m, d] = createdAt.split("-").map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(createdAt);
    }

    // fallback
    return new Date(createdAt);
  };

  const filteredOrders = useMemo(() => {
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;

    // convert to local-day inclusive bounds
    if (start) {
      start.setHours(0, 0, 0, 0);
    }
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    return orders.filter((order) => {
      // --- date ---
      const orderDate = parseOrderDate(order.createdAt);
      if (!orderDate) return false; // or decide to include if missing

      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;

      // --- payment status ---
      const isPaid =
        (order.paymentMethod && order.paymentMethod !== "cod") ||
        (order.status && order.status.toString().toLowerCase() === "paid");
      if (paymentFilter === "Paid" && !isPaid) return false;
      if (paymentFilter === "Pending" && isPaid) return false;

      // --- order status ---
      if (orderStatusFilter) {
        const normalizedStatus = (order.status || "").toString().toLowerCase();
        if (normalizedStatus !== orderStatusFilter.toLowerCase()) return false;
      }

      // --- search ---
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const fullName = `${order.billing?.firstName || ""} ${
          order.billing?.lastName || ""
        }`.toLowerCase();
        const username = (order.username || "").toLowerCase();
        const id = (order.id || "").toLowerCase();
        if (
          !id.includes(term) &&
          !fullName.includes(term) &&
          !username.includes(term)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    orders,
    startDate,
    endDate,
    paymentFilter,
    orderStatusFilter,
    searchTerm,
  ]);

  /** Pagination logic */
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const currentData = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages, currentPage]);

  /** Actions */
  const handleView = (order) => navigate(`/admin/orders/${order.id}`);

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setEditModalOpen(false);
  };

  /** Save edit changes */
  const handleSaveEdit = async () => {
    if (!selectedOrder) return;
    try {
      const prevStatus = orders.find((o) => o.id === selectedOrder.id)?.status;

      await updateOrder(selectedOrder.userId, selectedOrder, prevStatus);

      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? selectedOrder : o))
      );
      toast.success("Order updated successfully.");
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save order.");
    }
  };

  /** Delete order */
  const handleDelete = async (order) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(order.userId, order.id);

      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.success("Order deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete order.");
    }
  };

  /** Toggle delivered status */
  const handleToggleDelivered = async (order, checked) => {
    try {
      await toggleDeliveredStatus(order.userId, order, checked);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: checked ? "Delivered" : "Pending" }
            : o
        )
      );
      toast.success(`Order marked as ${checked ? "Delivered" : "Pending"}`);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleBulkDelivered = async (checked) => {
    try {
      await bulkUpdateDelivered(currentData, checked);
      setOrders((prev) =>
        prev.map((o) =>
          currentData.some((cd) => cd.id === o.id)
            ? { ...o, status: checked ? "Delivered" : "Pending" }
            : o
        )
      );
      toast.success(
        `Selected orders marked as ${checked ? "Delivered" : "Pending"}`
      );
    } catch (err) {
      toast.error("Failed to bulk update orders.");
    }
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
          <div className="date-filter mb-3">
            <p>Start Date</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-filter mb-3">
            <p>End Date</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="date-filter mt-3">
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
          <div className="date-filter mt-3">
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
        ) : currentData.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={currentData.every((o) => o.status === "Delivered")}
                    onChange={(e) => handleBulkDelivered(e.target.checked)}
                  />
                </th>
                <th>Order ID</th>
                <th>Username</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((order) => {
                const fullName = `${order.billing?.firstName || ""} ${
                  order.billing?.lastName || ""
                }`;
                const isPaid =
                  order.status === "paid" || order.paymentMethod !== "cod";
                const orderStatus = isPaid
                  ? "Delivered"
                  : order.status || "Pending";

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
                    <td>{fullName}</td>
                    <td>₹ {order.total?.toLocaleString() || 0}</td>
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
                        disabled={isPaid || orderStatus === "Delivered"}
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
        )}

        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {editModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Order</h2>
            <label>
              Order Status:
              <select
                value={selectedOrder.status || "Pending"}
                onChange={(e) =>
                  setSelectedOrder((s) => ({
                    ...s,
                    status: e.target.value,
                  }))
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
                value={
                  selectedOrder.paymentMethod === "cod" ? "Pending" : "Paid"
                }
                disabled={selectedOrder.paymentMethod !== "cod"}
                onChange={(e) =>
                  setSelectedOrder((s) => ({
                    ...s,
                    paymentMethod:
                      e.target.value === "Pending" ? "cod" : "online",
                  }))
                }
              >
                <option value="Pending">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </label>

            <div className="modal-buttons">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default OrdersPage;
