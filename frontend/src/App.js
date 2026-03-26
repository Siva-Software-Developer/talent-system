import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";
import "./App.css";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    // Apply Theme (Dark/Light)
    document.body.className = theme;

    // Apply Custom Primary Color
    const savedColor = localStorage.getItem("themeColor");
    if (savedColor) {
      applyColor(savedColor);
    }

    // Auto-login logic
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setRole(user.role);
      setIsLoggedIn(true);
      setPage("dashboard");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const applyColor = (color) => {
    document.documentElement.style.setProperty("--primary", color);
    // Dynamic Glow Calculation (Adding 30% opacity)
    document.documentElement.style.setProperty("--primary-glow", `${color}4d`);
    localStorage.setItem("themeColor", color);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole("");
    setPage("login");
  };

  return (
    // Dashboard irukkum bodu centering remove panna 'dashboard-mode' class add pannuvom
    <div className={`main ${(page === "dashboard" && isLoggedIn) ? "dashboard-mode" : ""}`}>
      
      {/* 🎨 TOP CONTROLS (Floating Glass) */}
      <div className="top-controls">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <div className="color-wrapper">
          <input
            type="color"
            className="color-picker"
            value={getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || "#6366f1"}
            onChange={(e) => applyColor(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ CONDITIONAL RENDERING */}
      {isLoggedIn && page === "dashboard" ? (
        role === "admin" ? (
          <AdminDashboard setPage={(p) => p === "login" ? handleLogout() : setPage(p)} />
        ) : (
          <Dashboard setPage={(p) => p === "login" ? handleLogout() : setPage(p)} />
        )
      ) : (
        <div className="auth-wrapper">
          <div className="card premium-glass">
            {page === "home" && (
              <div className="home-content">
                <h2 className="text-gradient">🚀 Talent OS</h2>
                <p className="subtitle">Master your workflow with precision.</p>
                <button className="btn-premium" onClick={() => setPage("login")}>Get Started</button>
                <button className="btn-outline" onClick={() => setPage("register")}>Create Account</button>
              </div>
            )}

            {page === "login" && (
              <Login setPage={(p) => {
                if (p === "dashboard") {
                  const user = JSON.parse(localStorage.getItem("user"));
                  setRole(user?.role || "employee");
                  setIsLoggedIn(true);
                  setPage("dashboard");
                } else { setPage(p); }
              }} />
            )}

            {page === "register" && <Register setPage={setPage} />}
            {page === "forgot" && <Forgot setPage={setPage} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;