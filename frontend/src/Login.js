import { useState } from "react";
import "./Login.css"; // Styles properly linked machi!

const API = "http://localhost:5000";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email || !password) {
      alert("Machi, email and password renduமே mukkiyam! 🛑");
      return;
    }

    try {
      let res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      let data = await res.json();

      if (res.status === 200) {
        alert("Welcome back, machi! 🚀");
        localStorage.setItem("user", JSON.stringify(data.user));
        // This triggers the App.js logic to switch to Dashboard
        setPage("dashboard");
      } else {
        alert(data.message || "Invalid credentials, machi!");
      }
    } catch (error) {
      console.log(error);
      alert("Server error, backend check pannu machi! 🛠️");
    }
  };

  return (
    <div className="login-container animate-fade-in">
      {/* 🚀 HEADER SECTION */}
      <div className="login-header">
        <h2 className="login-title-gradient">Welcome Back</h2>
        <p className="login-subtitle">Secure access to your Mission Control</p>
      </div>

      {/* 📋 FORM SECTION */}
      <div className="login-form">
        <div className="input-wrapper">
          <label className="input-label">Email Address</label>
          <input
            type="email"
            className="premium-input"
            placeholder="email@talent-os.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="premium-input"
            placeholder="ENTER YOUR REG PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* 🔘 ACTION BUTTON */}
        <button className="btn-premium login-btn-full" onClick={login}>
          Authenticate & Enter 🚀
        </button>
      </div>

      {/* 🔁 SECONDARY NAVIGATION */}
      <div className="login-footer-nav">
        <p className="nav-link" onClick={() => setPage("forgot")}>
          Forgot Password?
        </p>
        <span className="nav-divider"></span>
        <p className="nav-link highlight" onClick={() => setPage("register")}>
          New here? Create Account
        </p>
      </div>
    </div>
  );
}

export default Login;