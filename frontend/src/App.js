import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  // 🎨 THEME STATE
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // APPLY THEME + CUSTOM COLOR
  useEffect(() => {
    const savedColor = localStorage.getItem("themeColor");

    if (savedColor) {
      document.documentElement.style.setProperty("--bg", savedColor);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // 🎨 THEME FUNCTION
  const applyTheme = (mode) => {
    if (mode === "dark") {
      document.documentElement.style.setProperty("--bg", "#0f172a");
      document.documentElement.style.setProperty("--text", "#ffffff");
      document.documentElement.style.setProperty("--card", "rgba(255,255,255,0.05)");
    } else if (mode === "light") {
      document.documentElement.style.setProperty("--bg", "#f1f5f9");
      document.documentElement.style.setProperty("--text", "#000000");
      document.documentElement.style.setProperty("--card", "rgba(0,0,0,0.05)");
    }
    localStorage.setItem("theme", mode);
  };

  return (
    <div className="main">
      <div className="card">

        {/* 🎨 THEME CONTROLS */}
        <div className="theme-box">
          <button onClick={() => setTheme("dark")}>🌙</button>
          <button onClick={() => setTheme("light")}>☀️</button>

          <input
            type="color"
            title="Pick your background color"
            onChange={(e) => {
              document.documentElement.style.setProperty("--bg", e.target.value);
              localStorage.setItem("themeColor", e.target.value);
            }}
          />

          {/* RESET BUTTON */}
          <button
            onClick={() => {
              localStorage.removeItem("themeColor");
              setTheme("dark");
            }}
          >
            🔄
          </button>
        </div>

        {/* 🏠 HOME */}
        {page === "home" && (
          <>
            <h1>🔥 Talent System</h1>
            <button onClick={() => setPage("login")}>Login</button>
            <button onClick={() => setPage("register")}>Register</button>
          </>
        )}

        {/* 🔐 LOGIN */}
        {page === "login" && <Login setPage={setPage} />}

        {/* 📝 REGISTER */}
        {page === "register" && <Register setPage={setPage} />}

        {/* 🔁 FORGOT */}
        {page === "forgot" && <Forgot setPage={setPage} />}

      </div>
    </div>
  );
}

export default App;