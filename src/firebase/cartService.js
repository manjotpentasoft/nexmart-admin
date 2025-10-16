import { db } from "./firebaseConfig"; 
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

export const getUserCartRef = (userId) => doc(db, "carts", userId);

//  Save cart to Firestore
export const saveCartToFirestore = async (userId, cartItems) => {
  if (!userId) return;
  try {
    const cartRef = getUserCartRef(userId);
    await setDoc(cartRef, { items: cartItems }, { merge: true });
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

//  Load cart from Firestore
export const loadCartFromFirestore = async (userId) => {
  if (!userId) return [];
  try {
    const cartRef = getUserCartRef(userId);
    const docSnap = await getDoc(cartRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
};

//  Subscribe to realtime cart changes (optional)
export const subscribeToCart = (userId, onChange) => {
  if (!userId) return () => {};
  const cartRef = getUserCartRef(userId);
  return onSnapshot(cartRef, (snapshot) => {
    if (snapshot.exists()) {
      onChange(snapshot.data().items || []);
    }
  });
};
