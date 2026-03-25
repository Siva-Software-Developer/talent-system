import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";
import "./App.css";
import Dashboard from "./components/Dashboard";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.body.className = theme;

    const savedColor = localStorage.getItem("themeColor");
    if (savedColor) {
      applyColor(savedColor);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const applyColor = (color) => {
    document.documentElement.style.setProperty("--primary", color);
    localStorage.setItem("themeColor", color);
  };

  return (
    <div className="main">

      {/* TOP CONTROLS */}
      <div className="top-controls">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        <input
          type="color"
          className="color-picker"
          onChange={(e) => applyColor(e.target.value)}
        />
      </div>

      {/* ✅ DASHBOARD FULL SCREEN */}
      {page === "dashboard" && isLoggedIn ? (
        <Dashboard
          setPage={(p) => {
            if (p === "login") {
              setIsLoggedIn(false);
              setPage("login");
            } else {
              setPage(p);
            }
          }}
        />
      ) : (
        /* OTHER PAGES */
        <div className="card">

          {page === "home" && (
            <>
              <h2>🔥 Talent System</h2>
              <button onClick={() => setPage("login")}>Login</button>
              <button onClick={() => setPage("register")}>Register</button>
            </>
          )}

          {page === "login" && (
            <Login
              setPage={(p) => {
                if (p === "dashboard") {
                  setIsLoggedIn(true);
                  setPage("dashboard");
                } else {
                  setPage(p);
                }
              }}
            />
          )}

          {page === "register" && <Register setPage={setPage} />}
          {page === "forgot" && <Forgot setPage={setPage} />}

        </div>
      )}

    </div>
  );
}

export default App;