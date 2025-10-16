import React, { useState } from "react";
import "../../styles/home/ContactPage.css";
import Header from "../../components/home/Header";
import HighlightsSection from "../../components/home/HighlightSection";
import Footer from "../../components/home/Footer";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { HiOutlineMailOpen } from "react-icons/hi";
import { addContactMessage } from "../../firebase/contactService";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addContactMessage(formData);
      setSuccess("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setSuccess("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="contact-wrapper">
        {/* Contact Info Cards */}
        <h2 className="contact-title">Contact Information</h2>
        <div className="contact-info-row">
          {" "}
          <div className="contact-info-card">
            {" "}
            <div className="contact-info-icon">
              <FaLocationDot />
            </div>{" "}
            <div>
              {" "}
              <div className="contact-info-label">Corporate Office</div>{" "}
              <div className="contact-info-text">
                {" "}
                0233 Brisbane Cir.
                <br /> Shiloh, Australia 81063{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="contact-info-card">
            {" "}
            <div className="contact-info-icon">
              <FaLocationDot />
            </div>{" "}
            <div>
              {" "}
              <div className="contact-info-label">Main Warehouse</div>{" "}
              <div className="contact-info-text">
                {" "}
                0233 Brisbane Cir.
                <br /> Shiloh, Australia 81063{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="contact-info-card">
            {" "}
            <div className="contact-info-icon">
              <HiOutlineMailOpen />
            </div>{" "}
            <div>
              {" "}
              <div className="contact-info-label">Email Address</div>{" "}
              <div className="contact-info-text">
                {" "}
                contact@example.com
                <br /> support@example.com{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="contact-info-card">
            {" "}
            <div className="contact-info-icon">
              <FaPhoneAlt />
            </div>{" "}
            <div>
              {" "}
              <div className="contact-info-label">Phone Number</div>{" "}
              <div className="contact-info-text">
                {" "}
                Emergency Cases
                <br /> +(208) 544-0142 (24/7){" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>

        {/* Contact Form */}
        <div className="contact-main-row">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                className="contact-inp"
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                className="contact-inp"
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                className="contact-inp"
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                className="contact-inp"
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <textarea
                className="contact-inp textarea"
                name="message"
                placeholder="Write Message*"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button className="contact-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
            {success && (
              <p style={{ marginTop: "10px", color: "green" }}>{success}</p>
            )}
          </form>

          {/* Map Section */}
          <div className="map-section">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?... (same as before)"
              width="100%"
              height="330"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
      <HighlightsSection />
      <Footer />
    </>
  );
};

export default ContactPage;
