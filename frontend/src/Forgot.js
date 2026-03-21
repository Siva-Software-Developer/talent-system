import { useState } from "react";

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
    <>
      <h2>Forgot Password</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <button onClick={sendOtp}>Send OTP</button>

      <input placeholder="OTP" onChange={(e)=>setOtp(e.target.value)} />
      <input type="password" placeholder="New Password" onChange={(e)=>setPassword(e.target.value)} />

      <button onClick={reset}>Reset Password</button>

      <p onClick={()=>setPage("login")}>Back to Login</p>
    </>
  );
}

export default Forgot;