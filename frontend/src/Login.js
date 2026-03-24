import { useState } from "react";

const API = "http://localhost:5000";

function Login({ setPage }) {

  // ===========================
  // 📌 STATE
  // ===========================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ===========================
  // 🔐 LOGIN FUNCTION
  // ===========================
  const login = async () => {

    // Basic validation
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

      // Show message
      alert(data.message);

      // ✅ SUCCESS → GO TO DASHBOARD
      if (res.status === 200) {

        // ✅ NEW LINE (IMPORTANT - DO NOT REMOVE)
        localStorage.setItem("user", JSON.stringify(data.user));

        setPage("dashboard");
      }

    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  // ===========================
  // 🖥️ UI
  // ===========================
  return (
    <>
      <h2>Login</h2>

      {/* 📧 EMAIL */}
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* 🔑 PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* 🔘 LOGIN BUTTON */}
      <button onClick={login}>
        Login
      </button>

      {/* 🔁 NAVIGATION */}
      <p onClick={() => setPage("forgot")}>
        Forgot Password?
      </p>

      <p onClick={() => setPage("register")}>
        Create Account
      </p>
    </>
  );
}

export default Login;