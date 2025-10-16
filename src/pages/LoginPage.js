import React, { useState, useEffect } from "react";
import { login, loginWithGoogle, listenToUser } from "../firebase/authConfig";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill in all fields");

    setLoading(true);
    try {
      const userData = await login(email, password);
      // Remember me
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("email", email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("email");
      }

      // Listen to user data real-time
      listenToUser(userData.uid, (data) => {
        console.log("Realtime user data:", data);
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const userData = await loginWithGoogle();
      // Listen to user data real-time
      listenToUser(userData.uid, (data) => {
        console.log("Realtime user data:", data);
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    if (remembered === "true") {
      setRememberMe(true);
      const savedEmail = localStorage.getItem("email");
      if (savedEmail) setEmail(savedEmail);
    }
  }, []);

  return (
    <div className="login-container-wrapper">
      <div className="login-container">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2>Login</h2>
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading} className="button">
            {loading ? (
              <div
                className="button-loader"
              ></div>
            ) : (
              "Log In"
            )}
          </button>

          <button type="button" onClick={handleGoogleLogin} disabled={loading}>
            <FaGoogle /> Continue with Google
          </button>
        </form>
        <p>
          Not registered? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
