import React, { useEffect, useState } from "react";
import "../../styles/home/CheckoutPage.css";
import Header from "../../components/home/Header";
import HighlightsSection from "../../components/home/HighlightSection";
import Footer from "../../components/home/Footer";
import {
  loadCartFromFirestore,
  subscribeToCart,
  clearCartInFirestore,
  saveCartItem,
} from "../../firebase/cartService";
import { createOrder } from "../../firebase/ordersService";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { fetchUserData } from "../../firebase/userService"; // fetch user profile from Firestore

const paymentMethods = [{ label: "Cash on Delivery", description: "", value: "COD" }];
const countryOptions = ["Select Country", "Australia", "USA", "UK", "India", "Germany"];

const CheckoutPage = () => {
  const { user } = useAuth(); // Authenticated user
  const { shippingCost } = useSelector((state) => state.cart);

  const [cartProducts, setCartProducts] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [billing, setBilling] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Select Country",
    address: "",
    city: "",
    postcode: "",
  });

  // 1) Load user profile to auto-fill billing
  useEffect(() => {
    if (!user?.uid) return;

    const loadUserProfile = async () => {
      try {
        const profile = await fetchUserData(user.uid);
        if (profile) {
          setBilling({
            firstName: profile.name?.split(" ")[0] || "",
            lastName: profile.name?.split(" ")[1] || "",
            email: profile.email || "",
            phone: profile.phone || "",
            country: profile.country || "Select Country",
            address: profile.address || "",
            city: profile.city || "",
            postcode: profile.postcode || "",
          });
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };

    loadUserProfile();
  }, [user]);

  // 2) Load and subscribe to cart
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    loadCartFromFirestore(user.uid)
      .then((products) => {
        setCartProducts(products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("loadCart error:", err);
        setError("Failed loading cart");
        setLoading(false);
      });

    const unsubscribe = subscribeToCart(user.uid, (products) => setCartProducts(products || []));
    return () => unsubscribe();
  }, [user]);

  // Calculate totals
  const subtotal = cartProducts.reduce((s, p) => s + (p.price || 0) * (p.qty || 1), 0);
  const total = subtotal + Number(shippingCost || 0);

  const onBillingChange = (field) => (e) =>
    setBilling((s) => ({ ...s, [field]: e.target.value }));

  const validateBilling = () => {
    if (!billing.firstName) return "Enter full name";
    if (!billing.email) return "Enter email";
    if (!billing.address) return "Enter address";
    return null;
  };

  const updateQty = async (itemId, qty) => {
    const updated = cartProducts.map((p) =>
      p.id === itemId ? { ...p, qty: Math.max(1, qty) } : p
    );
    setCartProducts(updated);
    try {
      await saveCartItem(user.uid, updated);
    } catch (err) {
      console.error("saveCart error:", err);
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);
    if (!user?.uid) {
      setError("You must be logged in to place an order.");
      return;
    }
    if (!cartProducts.length) {
      setError("Cart is empty.");
      return;
    }
    const billingErr = validateBilling();
    if (billingErr) {
      setError(billingErr);
      return;
    }

    setProcessing(true);
    try {
      const orderPayload = {
        products: cartProducts,
        billing,
        paymentMethod: selectedPayment,
        subtotal,
        shipping: shippingCost,
        total,
      };

      const { id: orderId } = await createOrder(user.uid, orderPayload);

      await clearCartInFirestore(user.uid);
      setCartProducts([]);
      setOrderSuccess({ id: orderId, total });
    } catch (err) {
      console.error("placeOrder error:", err);
      setError("Failed to place order. Try again.");
    } finally {
      setProcessing(false);
    }
  };
  return (
    <>
      <Header />
      <section className="checkout-section">
        <h2 className="checkout-title">Checkout</h2>
        <div className="checkout-container">
          {/* Left Billing Form */}
          <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
            <div className="checkout-section-title">Billing Details</div>

            <div className="checkout-2col-row">
              <div>
                <label>
                  First Name<span>*</span>
                </label>
                <input value={billing.firstName} onChange={onBillingChange("firstName")} />
              </div>
              <div>
                <label>
                  Last Name<span></span>
                </label>
                <input value={billing.lastName} onChange={onBillingChange("lastName")} />
              </div>
            </div>

            <div className="checkout-2col-row">
              <div>
                <label>
                  Country<span>*</span>
                </label>
                <select value={billing.country} onChange={onBillingChange("country")}>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>
                  Phone Number<span>*</span>
                </label>
                <input value={billing.phone} onChange={onBillingChange("phone")} />
              </div>
            </div>

            <div className="checkout-2col-row">
              <div>
                <label>
                  Email Address<span>*</span>
                </label>
                <input type="email" value={billing.email} onChange={onBillingChange("email")} />
              </div>
            </div>

            <div className="checkout-2col-row">
              <div>
                <label>
                  Address<span>*</span>
                </label>
                <input value={billing.address} onChange={onBillingChange("address")} />
              </div>
            </div>

            <div className="checkout-2col-row">
              <div>
                <label>
                  Town / City<span>*</span>
                </label>
                <input value={billing.city} onChange={onBillingChange("city")} />
              </div>
              <div>
                <label>
                  Postcode / ZIP<span>*</span>
                </label>
                <input value={billing.postcode} onChange={onBillingChange("postcode")} />
              </div>
            </div>
          </form>

          {/* Right Sidebar */}
          <aside className="checkout-sidebar">
            <h3>Order Summary</h3>

            {loading ? (
              <div className="loader"></div>
            ) : cartProducts.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              <>
                <table className="checkout-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartProducts.map((item) => (
                      <tr key={item.id}>
                        <td className="product-column">
                          <img src={item.image} alt={item.name} className="cart-product-img" />
                          <span>{item.name}</span>
                        </td>
                        <td>
                          <input
                            className="qty-input"
                            type="number"
                            min="1"
                            value={item.qty || 1}
                            onChange={(e) => updateQty(item.id, Number(e.target.value))}
                          />
                        </td>
                        <td>₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>₹{shippingCost.toFixed(2)}</span>
                </div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <div className="payment-group">
                  {paymentMethods.map((method) => (
                    <div className="payment-method-row" key={method.value}>
                      <input
                        type="radio"
                        id={method.value}
                        name="payment"
                        checked={selectedPayment === method.value}
                        onChange={() => setSelectedPayment(method.value)}
                      />
                      <label htmlFor={method.value}>{method.label}</label>
                    </div>
                  ))}
                </div>

                {error && <div className="error-text">{error}</div>}
                {orderSuccess ? (
                  <div className="success-block">
                    <strong>Order placed!</strong>
                    <div>Order ID: {orderSuccess.id}</div>
                    <div>Total paid: ₹{orderSuccess.total.toFixed(2)}</div>
                  </div>
                ) : (
                  <button
                    className="checkout-btn"
                    onClick={handlePlaceOrder}
                    disabled={processing || cartProducts.length === 0}
                  >
                    {processing ? "Processing..." : "Place Order"}
                  </button>
                )}
              </>
            )}
          </aside>
        </div>
      </section>
      <HighlightsSection />
      <Footer />
    </>
  );
};

export default CheckoutPage;
