import { db } from "./firebaseConfig"; 
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

// Reference to user's wishlist collection
export const getUserWishlistCollection = (userId) => collection(db, "wishlists", userId, "items");

// Fetch wishlist items once
export const fetchWishlist = async (userId) => {
  if (!userId) return [];
  try {
    const querySnapshot = await getDocs(getUserWishlistCollection(userId));
    const wishlist = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return wishlist;
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    return [];
  }
};

// Add or update wishlist item
export const addToWishlist = async (userId, item) => {
  if (!userId || !item?.id) return;
  try {
    const itemRef = doc(getUserWishlistCollection(userId), item.id.toString());
    await setDoc(itemRef, item);
  } catch (err) {
    console.error("Error adding to wishlist:", err);
  }
};

// Remove wishlist item
export const removeFromWishlist = async (userId, itemId) => {
  if (!userId || !itemId) return;
  try {
    const itemRef = doc(getUserWishlistCollection(userId), itemId.toString());
    await deleteDoc(itemRef);
  } catch (err) {
    console.error("Error removing from wishlist:", err);
  }
};

// Real-time subscription
export const subscribeToWishlist = (userId, callback) => {
  if (!userId) return () => {};
  const unsub = onSnapshot(getUserWishlistCollection(userId), (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
  return unsub;
};
