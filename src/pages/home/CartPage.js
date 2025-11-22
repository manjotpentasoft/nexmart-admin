import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  setShippingCost,
  setCoupon,
  subscribeCart,
} from "../../redux/CartSlice";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import PopularProducts from "../../components/home/popularProducts";
import HighlightsSection from "../../components/home/HighlightSection";
import { FaTrash, FaArrowRight } from "react-icons/fa";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../../styles/home/CartPage.css";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, subtotal, total, shippingCost, coupon } = useSelector(
    (state) => state.cart
  );

  const userId = auth.currentUser?.uid;

  // Subscribe to Firestore cart in real-time
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = dispatch(subscribeCart(userId));
    return () => unsubscribe && unsubscribe();
  }, [dispatch, userId]);

  // Handle quantity change via thunk
  const handleQuantityChange = (id, e) => {
    const newQty = Number(e.target.value);
    if (newQty >= 1) {
      dispatch(updateQuantity(userId, id, newQty));
    }
  };

  // Handle removing item via thunk
  const handleRemove = (id) => {
    dispatch(removeFromCart(userId, id));
  };

  // Checkout
  const handleCheckout = () => {
    if (cartItems.length > 0) navigate("/checkout");
  };

  const isCartEmpty = cartItems.length === 0;

  return (
    <>
      <Header />
      <section className="cart-section">
        <div className="large-container">
          <h2 className="cart-title">Your Cart</h2>

          <div className="cart-container">
            <div className="cart-products">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {isCartEmpty ? (
                    <tr>
                      <td colSpan="5" className="empty-cart">
                        Your cart is empty
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="product-column">
                          <img
                            src={item.imageUrl || item.image || "/placeholder.png"}
                            alt={item.name}
                            className="cart-product-img"
                          />
                          {item.name}
                        </td>
                        <td>₹{Number(item.price).toFixed(2)}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e)}
                            className="qty-input"
                          />
                        </td>
                        <td>₹{(Number(item.price) * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemove(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sidebar */}
            <div className="cart-sidebar">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <select
                  value={shippingCost}
                  onChange={(e) =>
                    dispatch(setShippingCost(Number(e.target.value)))
                  }
                >
                  <option value={0}>Free</option>
                  <option value={10}>Flat Rate (₹10)</option>
                  <option value={20}>Local Delivery (₹20)</option>
                </select>
              </div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="summary-row coupon">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => dispatch(setCoupon(e.target.value))}
                />
                <button>
                  <FaArrowRight />
                </button>
              </div>

              <button
                className={`checkout-btn ${isCartEmpty ? "disabled" : ""}`}
                onClick={handleCheckout}
                disabled={isCartEmpty}
              >
                {isCartEmpty ? "Cart is Empty" : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <PopularProducts />
      <HighlightsSection />
      <Footer />
    </>
  );
};

export default CartPage;
