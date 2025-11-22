import React, { useState } from "react";
import "../../styles/home/Footer.css";
import { FaArrowRight, FaHeadphones } from "react-icons/fa";
import { addContactMessage } from "../../firebase/contactService"; 

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await addContactMessage({
        name: "Newsletter Subscriber",
        email,
        subject: "Subscription Request",
        message: "User subscribed to newsletter via footer form.",
      });
      setMessage("Subscription successful! 🎉");
      setEmail("");
    } catch (error) {
      setMessage("Failed to subscribe. Please try again.");
    }
    setLoading(false);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-contact">
          <div className="contact-info">
            <div className="phone-number">
              <FaHeadphones size={27} color="#F5B020" /> 91 2345 678
            </div>
            <div className="phone-label">Call our Hotline 24/7</div>
            <div className="address">
              57 Heol Isaf Station Road, Cardiff, UK
            </div>
            <div className="email">info@example.com</div>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-section">
            <h3 className="footer-section-title">Resources</h3>
            <ul className="link-list">
              <li><a href="/about">About Us</a></li>
              <li><a href="/shop">Shop</a></li>
              <li><a href="/cart">Cart</a></li>
            </ul>
          </div>

          <div className="link-section">
            <h3 className="footer-section-title">Store Info</h3>
            <ul className="link-list">
              <li><a href="#">Top Sold Items</a></li>
              <li><a href="#">New Arrivals</a></li>
            </ul>
          </div>

          <div className="link-section">
            <h3 className="footer-section-title">Support</h3>
            <ul className="link-list">
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="link-section subscribe-section">
          <h3 className="footer-section-title">Subscribe</h3>
          <p className="subscribe-text">
            Stay informed about upcoming events, webinars, and exciting happenings.
          </p>
          <form onSubmit={handleSubscribe} className="subscribe-form">
            <input
              type="email"
              placeholder="Email Address"
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="subscribe-btn"
              disabled={loading}
            >
              {loading ? "..." : <FaArrowRight />}
            </button>
          </form>
          {message && (
            <p style={{ color: message.includes("success") ? "green" : "red", marginTop: "10px" }}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">
          Copyright © 2025 Nexmart, Inc. All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
