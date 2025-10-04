import React, { useState } from "react";
import "./ProfilePage.css";
import { useSidebar } from "../../../contexts/SidebarContext";
import AdminLayout from "../../../components/AdminLayout";
import { auth } from "../../../firebase/firebaseConfig";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

export default function ChangePassword() {
  const { isSidebarOpen } = useSidebar();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      setMessage({ type: "error", text: "User not logged in!" });
      return;
    }

    try {
      // Reauthenticate the user with current password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, formData.newPassword);

      setMessage({ type: "success", text: "Password updated successfully!" });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error updating password:", err);
      let errorText = "Failed to update password.";
      if (err.code === "auth/wrong-password") {
        errorText = "Current password is incorrect.";
      } else if (err.code === "auth/weak-password") {
        errorText = "New password is too weak.";
      }
      setMessage({ type: "error", text: errorText });
    }

    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  return (
    <AdminLayout>
      <div className="profile-header">
        <h1>Change Password</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="profile-content">
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-fields">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
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
