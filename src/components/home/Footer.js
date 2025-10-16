import "../../styles/home/Footer.css";
import { FaArrowRight, FaHeadphones } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-contact">
          <div className="contact-info">
            <div className="phone-number">
              <FaHeadphones size={27} color="#F5B020" /> 91 2345 678
            </div>
            <div className="phone-label">Call out Hotline 24/7</div>
            <div className="address">
              57 heol Isaf Station Road, Cardiff, UK
            </div>
            <div className="email">info@example.com</div>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-section">
            <h3 className="footer-section-title">Resources</h3>
            <ul className="link-list">
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Shop</a>
              </li>
              <li>
                <a href="#">Cart</a>
              </li>
              <li>
                <a href="#">Brands</a>
              </li>
              <li>
                <a href="#">Mobile App</a>
              </li>
            </ul>
          </div>

          <div className="link-section">
            <h3 className="footer-section-title">Support</h3>
            <ul className="link-list">
              <li>
                <a href="#">Reviews</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
              <li>
                <a href="#">Return Policy</a>
              </li>
              <li>
                <a href="#">Online Support</a>
              </li>
              <li>
                <a href="#">Money Back</a>
              </li>
            </ul>
          </div>

          <div className="link-section">
            <h3 className="footer-section-title">Store Info</h3>
            <ul className="link-list">
              <li>
                <a href="#">Best Seller</a>
              </li>
              <li>
                <a href="#">Top Sold Items</a>
              </li>
              <li>
                <a href="#">New Arrivals</a>
              </li>
              <li>
                <a href="#">Flash Sale</a>
              </li>
              <li>
                <a href="#">Discount Products</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="link-section subscribe-section">
          <h3 className="footer-section-title">Subscribe</h3>
          <p className="subscribe-text">
            Stay inform about upcoming events, webinars, and exciting
            happenings.
          </p>
          <div className="subscribe-form">
            <input
              type="email"
              placeholder="Email Address"
              className="email-input"
            />
            <button className="subscribe-btn">
              <FaArrowRight />
            </button>
          </div>
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
