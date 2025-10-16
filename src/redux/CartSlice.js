import { createSlice } from "@reduxjs/toolkit";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

const initialState = {
  cartItems: [],
  shippingCost: 0,
  coupon: "",
  subtotal: 0,
  total: 0,
  userId: null, // can be replaced with auth.uid
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
      state.subtotal = action.payload.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      state.total = state.subtotal + Number(state.shippingCost || 0);
    },
    setShippingCost: (state, action) => {
      state.shippingCost = Number(action.payload);
      state.total = state.subtotal + state.shippingCost;
    },
    setCoupon: (state, action) => {
      state.coupon = action.payload;
    },
  },
});

export const { setCartItems, setShippingCost, setCoupon } = cartSlice.actions;
export default cartSlice.reducer;

/* ------------------- Firebase Actions ------------------- */

// Subscribe to realtime cart updates
export const subscribeToCart = (userId) => (dispatch) => {
  const cartRef = collection(db, "users", userId, "cart");

  // onSnapshot returns an unsubscribe function (not a promise)
  const unsubscribe = onSnapshot(cartRef, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    dispatch(setCartItems(items));
  });

  return unsubscribe;
};


// Update item quantity in Firestore
export const updateQuantity = (userId, id, quantity) => {
  const ref = doc(db, "users", userId, "cart", id);
  return updateDoc(ref, { quantity });
};

// Remove item
export const removeFromCart = (userId, id) => {
  const ref = doc(db, "users", userId, "cart", id);
  return deleteDoc(ref);
};

export const addToCart = (userId, product) => async (dispatch) => {
  try {
    if (!userId || !product || !product.id) {
      console.error("Invalid product or userId:", { userId, product });
      return;
    }

    const ref = doc(db, "users", userId, "cart", product.id);
    await setDoc(
      ref,
      { ...product, quantity: product.quantity || 1 },
      { merge: true }
    );

  } catch (err) {
    console.error("Error adding to cart:", err);
  }
};
