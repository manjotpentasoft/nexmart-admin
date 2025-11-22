// userService.js
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/firebaseSchema";

/**
 * Fetch user profile by userId
 */
export const fetchUserData = async (userId) => {
  if (!userId) return null;

  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const data = userSnap.data();
    return {
      id: userSnap.id,
      name: data.name,
      email: data.email,
      profilePic: data.profilePic,
      dateOfBirth: data.dateOfBirth || "-",
      address: data.address || "-",
      phone: data.phone || "-",
      billing: data.billing || {},
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

/**
 * Fetch all orders for a given user (filtered by userId)
 */
export const fetchUserOrders = async (userId) => {
  if (!userId) return [];

  try {
    // ✅ Fix: use SUBCOLLECTIONS.ORDERS (or a dedicated top-level orders collection if intended)
    const ordersRef = collection(db, SUBCOLLECTIONS.ORDERS);
    const q = query(ordersRef, where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

/**
 * Subscribe to user data realtime
 */
export const subscribeToUserData = (userId, callback) => {
  if (!userId || typeof callback !== "function") return () => {};

  const userRef = doc(db, COLLECTIONS.USERS, userId);
  return onSnapshot(
    userRef,
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (error) => console.error("User subscription error:", error)
  );
};

/**
 * Subscribe to user's orders realtime
 */
export const subscribeToUserOrders = (userId, callback) => {
  if (!userId || typeof callback !== "function") return () => {};

  const ordersRef = collection(db, SUBCOLLECTIONS.ORDERS);
  const q = query(ordersRef, where("userId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(orders);
    },
    (error) => console.error("Order subscription error:", error)
  );
};

/**
 * Update user document (merge mode)
 */
export const updateUserData = async (userId, data) => {
  if (!userId || !data) throw new Error("Missing userId or data for update.");

  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};
