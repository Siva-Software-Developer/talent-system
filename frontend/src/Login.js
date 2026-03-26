import { useState } from "react";
import "./Login.css"; // Import styles properly

const API = "http://localhost:5000";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      let res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      let data = await res.json();
      alert(data.message);

      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setPage("dashboard");
      }
    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  return (
    <div className="auth-content">
      <h2 className="text-gradient">Welcome Back</h2>
      <p className="subtitle">Sign in to manage your talent portal</p>

      {/* 📧 EMAIL */}
      <input
        className="premium-input"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* 🔑 PASSWORD */}
      <input
        type="password"
        className="premium-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* 🔘 LOGIN BUTTON */}
      <button className="btn-premium" onClick={login}>
        Login to Dashboard 🚀
      </button>

      {/* 🔁 NAVIGATION */}
      <div className="auth-nav">
        <p onClick={() => setPage("forgot")}>Forgot Password?</p>
        <span className="dot">•</span>
        <p onClick={() => setPage("register")}>Create Account</p>
      </div>
    </div>
  );
}

export default Login;