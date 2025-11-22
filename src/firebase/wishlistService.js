import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/firebaseSchema";

/**
 * Load all wishlist items for a given user
 */
export const loadWishlistFromFirestore = async (userId) => {
  if (!userId) {
    console.warn("loadWishlistFromFirestore: Missing userId");
    return [];
  }

  try {
    const wishlistRef = collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.WISHLIST);
    const snap = await getDocs(wishlistRef);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Failed to load wishlist:", error);
    return [];
  }
};

/**
 * Save or update a wishlist item
 */
export const saveWishlistItem = async (userId, item) => {
  if (!userId || !item?.id) {
    console.error("saveWishlistItem: Missing userId or item.id", { userId, item });
    return;
  }

  try {
    const itemRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.WISHLIST, item.id.toString());
    await setDoc(itemRef, { ...item, addedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error saving wishlist item:", error);
  }
};

/**
 * Remove wishlist item
 */
export const removeWishlistItem = async (userId, itemId) => {
  if (!userId || !itemId) {
    console.error("removeWishlistItem: Missing userId or itemId", { userId, itemId });
    return;
  }

  try {
    const itemRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.WISHLIST, itemId.toString());
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Failed to remove wishlist item:", error);
    throw error;
  }
};

/**
 * Toggle wishlist item (add if missing, remove if exists)
 */
export const toggleWishlistItem = async (userId, item) => {
  if (!userId || !item?.id) return;

  try {
    const itemRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.WISHLIST, item.id.toString());
    const snapshot = await getDoc(itemRef);

    if (snapshot.exists()) {
      await deleteDoc(itemRef);
    } else {
      await setDoc(itemRef, { ...item, addedAt: serverTimestamp() });
    }
  } catch (error) {
    console.error("Error toggling wishlist item:", error);
  }
};

/**
 * Subscribe to wishlist items in real-time
 */
export const subscribeToWishlist = (userId, callback) => {
  if (!userId || typeof callback !== "function") {
    console.warn("subscribeToWishlist: Invalid arguments");
    return () => {};
  }

  const wishlistRef = collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.WISHLIST);
  return onSnapshot(
    wishlistRef,
    (snap) => {
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(items);
    },
    (error) => console.error("Wishlist subscription error:", error)
  );
};
