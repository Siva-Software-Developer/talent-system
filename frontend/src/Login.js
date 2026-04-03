import React, { useState } from "react";
import "./Login.css";
import { LogIn, Lock, Mail, ArrowRight } from "lucide-react";

const API = "http://localhost:5000";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Machi, email and password renduமே mukkiyam! 🛑");
      return;
    }

    setLoading(true);
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
        setPage("dashboard");
      } else {
        alert(data.message || "Invalid credentials, machi!");
      }
    } catch (error) {
      console.log(error);
      alert("Server error, backend check pannu machi! 🛠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-glass-wrapper animate-fade-in">
      <div className="login-container">
        {/* 🚀 HEADER SECTION */}
        <div className="login-header">
          <div className="login-logo-circle">
            <LogIn size={32} color="#38bdf8" />
          </div>
          <h2 className="login-title-gradient">Welcome Back</h2>
          <p className="login-subtitle">Secure access to your Mission Control</p>
        </div>

        {/* 📋 FORM SECTION */}
        <div className="login-form">
          <div className="input-wrapper">
            <label className="input-label">Email Address</label>
            <div className="input-icon-container">
              <Mail className="input-inner-icon" size={18} />
              <input
                type="email"
                className="premium-input with-icon"
                placeholder="email@talent-os.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Password</label>
            <div className="input-icon-container">
              <Lock className="input-inner-icon" size={18} />
              <input
                type="password"
                className="premium-input with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && login()}
              />
            </div>
          </div>

          {/* 🔘 ACTION BUTTON */}
          <button 
            className={`btn-premium login-btn-full ${loading ? 'loading' : ''}`} 
            onClick={login}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Authenticate & Enter"} 
            {!loading && <ArrowRight size={18} style={{marginLeft: '10px'}} />}
          </button>
        </div>

        {/* 🔁 SECONDARY NAVIGATION */}
        <div className="login-footer-nav">
          <p className="nav-link" onClick={() => setPage("forgot")}>
            Forgot Password?
          </p>
          <span className="nav-divider"></span>
          <p className="nav-link highlight" onClick={() => setPage("register")}>
            New here? <span className="text-glow">Create Account</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;