import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  setShippingCost,
  setCoupon,
  subscribeToCart,
} from "../../redux/CartSlice";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import PopularProducts from "../../components/home/popularProducts";
import HighlightsSection from "../../components/home/HighlightSection";
import { FaTrash, FaArrowRight } from "react-icons/fa";
import "../../styles/home/CartPage.css";

const CartPage = () => {
  const dispatch = useDispatch();
  const { cartItems, subtotal, total, shippingCost, coupon } = useSelector(
    (state) => state.cart
  );
  const userId = "demoUser"; // replace with current user ID (e.g., auth.uid)

  useEffect(() => {
    const unsubscribe = dispatch(subscribeToCart(userId));
    return () => unsubscribe && unsubscribe();
  }, [dispatch, userId]);

  const handleQuantityChange = (id, e) => {
    const newQty = Number(e.target.value);
    if (newQty >= 1) updateQuantity(userId, id, newQty);
  };

  const handleRemove = (id) => removeFromCart(userId, id);

  const handleShippingChange = (e) =>
    dispatch(setShippingCost(e.target.value));

  const handleCouponChange = (e) => dispatch(setCoupon(e.target.value));

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
                  {cartItems.length === 0 ? (
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
                            src={
                              item.imageUrl || item.image || "/placeholder.png"
                            }
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
                        <td>
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </td>
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
                <span>Shipping:</span>
                <select value={shippingCost} onChange={handleShippingChange}>
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
                  onChange={handleCouponChange}
                />
                <button>
                  <FaArrowRight />
                </button>
              </div>

              <button className="checkout-btn">Proceed to Checkout</button>
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
