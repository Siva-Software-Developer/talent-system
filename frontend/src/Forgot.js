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
    <div className="forgot-content">
      <h2 className="text-gradient">Recovery ✨</h2>
      <p className="subtitle">Enter your email to receive an OTP</p>

      <div className="input-section">
        <input 
          className="premium-input" 
          placeholder="Email Address" 
          onChange={(e)=>setEmail(e.target.value)} 
        />
        <button className="btn-otp" onClick={sendOtp}>
          Send OTP 📩
        </button>
      </div>

      <div className="divider"><span>verification</span></div>

      <div className="input-section">
        <input 
          className="premium-input" 
          placeholder="Enter OTP" 
          onChange={(e)=>setOtp(e.target.value)} 
        />
        <input 
          type="password" 
          className="premium-input" 
          placeholder="New Password" 
          onChange={(e)=>setPassword(e.target.value)} 
        />
        <button className="btn-premium" onClick={reset}>
          Reset Password 🔐
        </button>
      </div>

      <p className="back-link" onClick={()=>setPage("login")}>
        ← Back to Login
      </p>
    </div>
  );
}

export default Forgot;