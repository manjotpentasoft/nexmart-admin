// cartService.js
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import FIREBASE_SCHEMA from "../constants/firebaseSchema";

const { COLLECTIONS, SUBCOLLECTIONS } = FIREBASE_SCHEMA;

/** Helper — returns the cart subcollection reference for a given user */
const getUserCartCollection = (userId) =>
  collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.CART);

/** Load all cart items for a user */
export const loadCartFromFirestore = async (userId) => {
  if (!userId) return [];
  try {
    const snapshot = await getDocs(getUserCartCollection(userId));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error loading cart:", err);
    return [];
  }
};

/** Add or update a single cart item (item.id required) */
export const saveCartItem = async (userId, item) => {
  if (!userId || !item?.id) return;
  try {
    const itemRef = doc(getUserCartCollection(userId), item.id.toString());
    await setDoc(itemRef, item, { merge: true });
  } catch (err) {
    console.error("Error saving cart item:", err);
  }
};

/** Remove a cart item by id */
export const removeCartItem = async (userId, itemId) => {
  if (!userId || !itemId) return;
  try {
    const itemRef = doc(getUserCartCollection(userId), itemId.toString());
    await deleteDoc(itemRef);
  } catch (err) {
    console.error("Error removing cart item:", err);
  }
};

/** Clear the entire cart */
export const clearCartInFirestore = async (userId) => {
  if (!userId) return;
  try {
    const snapshot = await getDocs(getUserCartCollection(userId));
    const deletions = snapshot.docs.map((d) =>
      deleteDoc(doc(db, getUserCartCollection(userId).path, d.id))
    );
    await Promise.all(deletions);
  } catch (err) {
    console.error("Error clearing cart:", err);
  }
};

/** Subscribe to realtime cart updates (callback receives array of items) */
export const subscribeToCart = (userId, callback) => {
  if (!userId) return () => {};
  const unsub = onSnapshot(getUserCartCollection(userId), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
  return unsub;
};
