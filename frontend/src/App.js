import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";
import "./App.css";
import Dashboard from "./components/Dashboard";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // 🔐 LOGIN STATE
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ===========================
  // 🎨 APPLY THEME
  // ===========================
  useEffect(() => {
    document.body.className = theme;

    const savedColor = localStorage.getItem("themeColor");
    if (savedColor) {
      applyColor(savedColor);
    }
  }, [theme]);

  // ===========================
  // 🌙 TOGGLE THEME
  // ===========================
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // ===========================
  // 🎨 APPLY COLOR
  // ===========================
  const applyColor = (color) => {
    document.documentElement.style.setProperty("--secondary", color);
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--primary", color);

    localStorage.setItem("themeColor", color);
  };

  // ===========================
  // 🖥️ UI
  // ===========================
  return (
    <div className="main">

      {/* 🔝 TOP CONTROLS */}
      <div className="top-controls">

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        <input
          type="color"
          className="color-picker"
          title="Choose your theme color"
          onChange={(e) => applyColor(e.target.value)}
        />

      </div>

      <div className="card">

        {/* 🏠 HOME */}
        {page === "home" && (
          <>
            <h2>🔥 Talent System</h2>
            <button onClick={() => setPage("login")}>Login</button>
            <button onClick={() => setPage("register")}>Register</button>
          </>
        )}

        {/* 🔐 LOGIN */}
        {page === "login" && (
          <Login
            setPage={(p) => {
              if (p === "dashboard") {
                setIsLoggedIn(true);   // ✅ LOGIN SUCCESS
                setPage("dashboard");  // 👉 redirect
              } else {
                setPage(p);
              }
            }}
          />
        )}

        {/* 📝 REGISTER */}
        {page === "register" && (
          <Register setPage={setPage} />
        )}

        {/* 🔁 FORGOT */}
        {page === "forgot" && (
          <Forgot setPage={setPage} />
        )}

        {/* 📊 DASHBOARD */}
        {page === "dashboard" && isLoggedIn && (
          <Dashboard
            setPage={(p) => {
              if (p === "login") {
                setIsLoggedIn(false); // ✅ LOGOUT
                setPage("login");
              } else {
                setPage(p);
              }
            }}
          />
        )}

      </div>
    </div>
  );
}

export default App;