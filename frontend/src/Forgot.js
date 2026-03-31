import { useState } from "react";
import "./Forgot.css";

const API = "http://localhost:5000";

function Forgot({ setPage }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const sendOtp = async () => {
    let res = await fetch(`${API}/forgot-send-otp`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email })
    });
    alert((await res.json()).message);
  };

  const reset = async () => {
    let res = await fetch(`${API}/reset-password`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, otp, password })
    });

    alert((await res.json()).message);
    setPage("login");
  };

  return (
    <div className="recovery-container animate-fade-in">
      <div className="recovery-header">
        <h2 className="recovery-title-gradient">Recovery ✨</h2>
        <p className="recovery-subtitle">Regain access to your mission control</p>
      </div>

      {/* STEP 1: Email & OTP Request */}
      <div className="recovery-section">
        <div className="input-group-glass">
          <input 
            className="recovery-input" 
            placeholder="Registered Email" 
            onChange={(e)=>setEmail(e.target.value)} 
          />
          <button className="btn-send-otp" onClick={sendOtp}>
            Send OTP 📩
          </button>
        </div>
      </div>

      <div className="recovery-divider">
        <span>VERIFICATION DETAILS</span>
      </div>

      {/* STEP 2: OTP & New Password */}
      <div className="recovery-section">
        <input 
          className="recovery-input" 
          placeholder="Enter 6-Digit OTP" 
          onChange={(e)=>setOtp(e.target.value)} 
        />
        <input 
          type="password" 
          className="recovery-input" 
          placeholder="Set New Password" 
          onChange={(e)=>setPassword(e.target.value)} 
        />
        <button className="btn-reset-password" onClick={reset}>
          Reset Password 🔐
        </button>
      </div>

      <div className="recovery-footer">
        <p className="back-to-login" onClick={()=>setPage("login")}>
          <span className="arrow">←</span> Back to Login
        </p>
      </div>
    </div>
  );
}

export default Forgot;