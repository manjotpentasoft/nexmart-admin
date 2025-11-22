import React, { useState, useEffect } from "react";
import { login, 
  // loginWithGoogle, 
  // listenToUser
 } from "../firebase/authConfig";
import { useNavigate, Link } from "react-router-dom";
// import { FaGoogle } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Login.css";

function Login() {
const ADMIN_UID = process.env.REACT_APP_ADMIN_UID;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);

      if (userData.uid === ADMIN_UID) {
        navigate("/admin/dashboard");
      } else {
        navigate("/"); 
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     const userData = await loginWithGoogle();
  //     if (userData.uid === ADMIN_UID) {
  //       navigate("/admin/dashboard");
  //     } else {
  //       navigate("/");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
            {loading ? <div className="button-loader"></div> : "Log In"}
          </button>

          {/* <button type="button" onClick={handleGoogleLogin} disabled={loading}>
            <FaGoogle /> Continue with Google
          </button> */}
        </form>
        <p>
          Not registered? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
