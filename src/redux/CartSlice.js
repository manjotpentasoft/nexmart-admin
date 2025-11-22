// src/redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";
import * as cartService from "../firebase/cartService";

const initialState = {
  cartItems: [],
  shippingCost: 0,
  coupon: "",
  subtotal: 0,
  total: 0,
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
    clearCartState: (state) => {
      state.cartItems = [];
      state.subtotal = 0;
      state.total = 0;
    },
  },
});

export const { setCartItems, setShippingCost, clearCartState, setCoupon } = cartSlice.actions;
export default cartSlice.reducer;

/* ------------------- Redux Thunks ------------------- */

// Subscribe to realtime updates
export const subscribeCart = (userId) => (dispatch) => {
  const unsubscribe = cartService.subscribeToCart(userId, (items) => {
    dispatch(setCartItems(items));
  });
  return unsubscribe;
};

// Add item to cart
export const addToCart = (userId, product) => async (dispatch) => {
  await cartService.saveCartItem(userId, { ...product, quantity: product.quantity || 1 });
  // realtime subscription will update state automatically
};

// Update quantity
export const updateQuantity = (userId, id, quantity) => async (dispatch) => {
  await cartService.saveCartItem(userId, { id, quantity });
};

// Remove item
export const removeFromCart = (userId, itemId) => async (dispatch) => {
  await cartService.removeCartItem(userId, itemId);
};

// Clear cart
export const clearCart = (userId) => async (dispatch) => {
  await cartService.clearCartInFirestore(userId);
  dispatch(clearCartState());
};
