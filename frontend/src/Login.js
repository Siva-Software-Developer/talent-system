import React, { useState } from "react";
import "./Login.css";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

const API = "http://localhost:5000";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Both email and password important!!!");
      return;
    }

    setLoading(true);

    try {
      // 🔥 clear old session (IMPORTANT FIX)
      localStorage.removeItem("dtms_user");

      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data); // debug

      if (res.status === 200 && data && data.user && data.user.role) {
        alert("Welcome back, machi! 🚀");

        // ✅ store correct format
        localStorage.setItem("dtms_user", JSON.stringify(data.user));

        // ✅ trigger App.js flow
        setPage("dashboard");

      } else {
        alert(data.message || "Invalid credentials, machi!");
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert("Server error, check your backend 🛠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dtms-auth-wrapper mono-theme">
      <div className="dtms-login-card">

        {/* 🏢 HEADER */}
        <div className="dtms-header-section">
          <div className="dtms-logo-box">
            <ShieldCheck size={40} strokeWidth={1.5} color="#000" />
          </div>
          <h1 className="dtms-main-title">Digital Talent Management System</h1>
          <p className="dtms-tagline">Professional Portal Access</p>
        </div>

        <hr className="dtms-divider" />

        {/* 📋 FORM */}
        <div className="dtms-form-container">

          <div className="dtms-input-group">
            <label className="dtms-label">Corporate Email</label>
            <div className="dtms-input-relative">
              <Mail className="dtms-input-icon" size={18} />
              <input
                type="email"
                className="dtms-input-field"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="dtms-input-group">
            <label className="dtms-label">Secure Password</label>
            <div className="dtms-input-relative">
              <Lock className="dtms-input-icon" size={18} />
              <input
                type="password"
                className="dtms-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") login();
                }}
              />
            </div>
          </div>

          {/* 🔘 BUTTON */}
          <button
            className={`dtms-primary-btn ${loading ? "dtms-btn-loading" : ""}`}
            onClick={login}
            disabled={loading}
          >
            {loading ? "VERIFYING..." : "SIGN IN TO SYSTEM"}
            {!loading && <ArrowRight size={18} className="dtms-btn-arrow" />}
          </button>

        </div>

        {/* 🔗 LINKS */}
        <div className="dtms-footer-links">
          <span className="dtms-link" onClick={() => setPage("forgot")}>
            Forgot Credentials?
          </span>
          <span className="dtms-pipe">|</span>
          <span
            className="dtms-link dtms-link-bold"
            onClick={() => setPage("register")}
          >
            Register New Account
          </span>
        </div>

        <div className="dtms-system-footer">
          <p>© 2026 DTMS Infrastructure. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}

export default Login;