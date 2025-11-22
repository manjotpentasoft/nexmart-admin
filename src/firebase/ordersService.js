// ordersService.js
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import FIREBASE_SCHEMA from "../constants/firebaseSchema";

const { COLLECTIONS } = FIREBASE_SCHEMA;

/**
 * Subscribe to a user's orders in real-time.
 */
export const subscribeToUserOrders = (userId, callback) => {
  const ordersCol = collection(db, COLLECTIONS.USERS, userId, "orders");

  const unsubscribe = onSnapshot(
    ordersCol,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId,
          products: data.products || [],
          total: data.total || 0,
          status: data.status || "Pending",
          createdAt: data.createdAt || null,
        };
      });

      orders.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      callback(orders);
    },
    (error) => {
      console.error("Failed to subscribe to user orders:", error);
      callback([]);
    }
  );

  return unsubscribe;
};

/** Fetch all orders across all users (admin view) */
export const fetchAllUserOrders = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const orders = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const ordersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS, userId, "orders"));
      ordersSnapshot.forEach((o) => {
        orders.push({ ...o.data(), id: o.id, userId });
      });
    }

    return orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (err) {
    console.error("Error fetching all user orders:", err);
    throw err;
  }
};

/** Create an order for a user */
export const createOrder = async (userId, orderPayload) => {
  try {
    const ordersCol = collection(db, COLLECTIONS.USERS, userId, "orders");
    const docRef = await addDoc(ordersCol, {
      ...orderPayload,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (err) {
    console.error("Error creating order:", err);
    throw err;
  }
};

/** Update an existing order (adjust product stock on Delivered toggle) */
export const updateOrder = async (userId, order, prevStatus) => {
  try {
    const orderRef = doc(db, COLLECTIONS.USERS, userId, "orders", order.id);

    const shouldDecreaseStock = order.status === "Delivered" && prevStatus !== "Delivered";
    const shouldIncreaseStock = order.status !== "Delivered" && prevStatus === "Delivered";

    if (shouldDecreaseStock || shouldIncreaseStock) {
      const productUpdates = (order.products || []).map(async (product) => {
        const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
        await updateDoc(productRef, {
          stock: shouldDecreaseStock ? increment(-product.quantity) : increment(product.quantity),
        });
      });
      await Promise.all(productUpdates);
    }

    await updateDoc(orderRef, {
      status: order.status,
      paymentMethod: order.paymentMethod,
    });
  } catch (err) {
    console.error("Error updating user order:", err);
    throw err;
  }
};

/** Delete order */
export const deleteOrder = async (userId, orderId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId, "orders", orderId));
  } catch (err) {
    console.error("Error deleting user order:", err);
    throw err;
  }
};

/** Toggle delivered status for single order and update product stock */
export const toggleDeliveredStatus = async (userId, order, checked) => {
  try {
    const orderRef = doc(db, COLLECTIONS.USERS, userId, "orders", order.id);

    const productUpdates = (order.products || []).map(async (product) => {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
      await updateDoc(productRef, {
        stock: checked ? increment(-product.quantity) : increment(product.quantity),
      });
    });

    await Promise.all(productUpdates);

    await updateDoc(orderRef, {
      status: checked ? "Delivered" : "Pending",
    });
  } catch (err) {
    console.error("Error toggling delivered status:", err);
    throw err;
  }
};

/** Bulk update delivered status for several orders */
export const bulkUpdateDelivered = async (orders, checked) => {
  try {
    const updates = orders.map(async (order) => {
      const orderRef = doc(db, COLLECTIONS.USERS, order.userId, "orders", order.id);

      const productUpdates = (order.products || []).map(async (product) => {
        const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
        await updateDoc(productRef, {
          stock: checked ? increment(-product.quantity) : increment(product.quantity),
        });
      });

      await Promise.all(productUpdates);

      await updateDoc(orderRef, {
        status: checked ? "Delivered" : "Pending",
      });
    });

    await Promise.all(updates);
  } catch (err) {
    console.error("Error bulk updating user orders:", err);
    throw err;
  }
};
