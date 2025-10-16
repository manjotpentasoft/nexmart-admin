import React, { useState, useRef, useEffect } from "react";
import "./ProfilePage.css";
import AdminLayout from "../../../components/AdminLayout";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import { db, auth } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const fileInputRef = useRef(null);

  // state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState(null); // null means show icon
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch user data on mount and listen in real-time
  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setProfileImage(data.image || null);
      }
    });

    return () => unsubscribe();
  }, []);

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // convert image to base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result); // base64
      };
      reader.readAsDataURL(file);
    }
  };

  // save to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userRef,
        {
          ...profileData,
          image: profileImage || null,
        },
        { merge: true }
      );
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({ type: "error", text: "Failed to update profile." });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <AdminLayout>
      <div className="profile-header">
        <h1>Update Profile</h1>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="profile-content">
        <form className="profile-form" onSubmit={handleSubmit}>
          {/* Profile Image Section */}
          <div className="profile-image-section">
            <div className="image-upload-container">
              <div className="current-image">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-avatar" />
                ) : (
                  <FaUserCircle className="profile-avatar-icon" />
                )}
                <div className="image-upload-overlay">
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaCamera /> Upload Image...
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              <p className="image-help-text">Image Size Should Be 40 x 40.</p>
            </div>
          </div>

          {/* Profile Form Fields */}
          <div className="profile-fields">
            <div className="form-group">
              <label htmlFor="name">User Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
