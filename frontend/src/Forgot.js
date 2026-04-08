import React, { useState } from "react";
import "./Forgot.css";
import { ShieldAlert, Mail, Lock, Key, ArrowLeft, RefreshCw } from "lucide-react";

const API = "http://localhost:5000";

function Forgot({ setPage }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) return alert("Enter you Email 📧");
    setLoading(true);
    try {
      let res = await fetch(`${API}/forgot-send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      let data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("OTP Send failed da!");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (!email || !otp || !password) {
      alert("Fill all the fields! 📝");
      return;
    }
    try {
      let res = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password })
      });
      let data = await res.json();
      alert(data.message);
      if (res.status === 200) setPage("login");
    } catch (err) {
      alert("Reset error!");
    }
  };

  return (
    <div className="dtms-auth-wrapper dtms-forgot-page">
      <div className="dtms-forgot-card">
        
        {/* 🏢 BRANDING & HEADER */}
        <div className="dtms-header-section">
          <div className="dtms-logo-box">
            <ShieldAlert size={36} strokeWidth={1.5} color="#fff" />
          </div>
          <h1 className="dtms-main-title">Digital Talent Management System</h1>
          <p className="dtms-tagline">Secure Credential Recovery</p>
        </div>

        <hr className="dtms-divider" />

        <div className="dtms-form-container">
          
          {/* STEP 1: Email Verification */}
          <div className="dtms-input-group">
            <label className="dtms-label">Registered Email</label>
            <div className="dtms-otp-layout">
              <div className="dtms-input-relative dtms-flex-2">
                <Mail className="dtms-input-icon" size={16} />
                <input 
                  className="dtms-input-field" 
                  placeholder="name@company.com" 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <button 
                className={`dtms-otp-btn ${loading ? 'dtms-spinning' : ''}`} 
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? <RefreshCw size={14} className="dtms-spinning" /> : "SEND OTP"}
              </button>
            </div>
          </div>

          <div className="dtms-system-divider">
            <span>VERIFICATION REQUIRED</span>
          </div>

          {/* STEP 2: OTP & New Password */}
          <div className="dtms-input-group">
            <label className="dtms-label">6-Digit Code</label>
            <div className="dtms-input-relative">
              <Key className="dtms-input-icon" size={16} />
              <input 
                className="dtms-input-field dtms-otp-field" 
                placeholder="0 0 0 0 0 0" 
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)} 
              />
            </div>
          </div>

          <div className="dtms-input-group">
            <label className="dtms-label">New Secure Password</label>
            <div className="dtms-input-relative">
              <Lock className="dtms-input-icon" size={16} />
              <input 
                type="password" 
                className="dtms-input-field" 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          {/* Action Button */}
          <button className="dtms-primary-btn" onClick={reset}>
            UPDATE CREDENTIALS
          </button>
        </div>

        {/* 🔗 BACK NAVIGATION */}
        <div className="dtms-footer-links">
          <p className="dtms-link dtms-back-link" onClick={() => setPage("login")}>
            <ArrowLeft size={14} style={{ marginRight: '6px' }} />
            Back to System Sign In
          </p>
        </div>

        <div className="dtms-system-footer">
          <p>© 2026 DTMS Infrastructure. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Forgot;