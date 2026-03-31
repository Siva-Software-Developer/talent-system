import { useState, useEffect } from "react";
import "./App.css";

// 📂 AUTH COMPONENTS
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";

// 📂 DASHBOARD COMPONENTS
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  // 🛠️ THEME & SESSION INITIALIZATION
  useEffect(() => {
    // Apply Theme (Dark/Light)
    document.body.className = theme;

    // Apply Global Primary Color
    const savedColor = localStorage.getItem("themeColor") || "#6366f1";
    applyColor(savedColor);

    // 🔄 SESSION CHECK (Auto-Login)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setRole(user.role);
      setIsLoggedIn(true);
      setPage("dashboard");
    }
  }, [theme]);

  // 🌓 TOGGLE THEME LOGIC
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // 🎨 DYNAMIC COLOR THEMING
  const applyColor = (color) => {
    document.documentElement.style.setProperty("--primary", color);
    // Dynamic Glow Calculation (Adding opacity)
    document.documentElement.style.setProperty("--primary-glow", `${color}4d`);
    localStorage.setItem("themeColor", color);
  };

  // 🚪 LOGOUT LOGIC
  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole("");
    setPage("login");
  };

  // 🔄 LOGIN SUCCESS HANDLER
  const handleLoginSuccess = (userRole) => {
    setRole(userRole);
    setIsLoggedIn(true);
    setPage("dashboard");
  };

  return (
    <div className={`app-root-container ${theme} ${(page === "dashboard" && isLoggedIn) ? "layout-dashboard" : "layout-auth"}`}>
      
      {/* 🎨 FLOATING GLOBAL CONTROLS (Glassmorphism Style) */}
      <div className="global-controls-glass">
        <button className="ctrl-theme-btn" onClick={toggleTheme} title="Toggle Mode">
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        
        <div className="ctrl-color-picker-wrapper">
          <input
            type="color"
            className="ctrl-color-input"
            onChange={(e) => applyColor(e.target.value)}
            title="Customize Theme Color"
          />
        </div>
      </div>

      {/* ✅ MAIN ROUTING LOGIC */}
      {isLoggedIn && page === "dashboard" ? (
        <div className="dashboard-view-wrapper animate-fade-in">
          {role === "admin" ? (
            <AdminDashboard setPage={(p) => p === "login" ? handleLogout() : setPage(p)} />
          ) : (
            <Dashboard setPage={(p) => p === "login" ? handleLogout() : setPage(p)} />
          )}
        </div>
      ) : (
        /* 🔐 AUTH SCREENS (Home, Login, Register, Forgot) */
        <div className="auth-screen-overlay">
          <div className="auth-card-glass animate-fade-in">
            
            {/* 🏠 HOME HERO */}
            {page === "home" && (
              <div className="home-hero-content">
                <h1 className="brand-logo-text">🚀 Talent OS</h1>
                <p className="brand-tagline">Streamlining professional workflows with AI-driven intelligence.</p>
                <div className="home-action-btns">
                  <button className="btn-primary-glow" onClick={() => setPage("login")}>Get Started</button>
                  <button className="btn-secondary-outline" onClick={() => setPage("register")}>Join Team</button>
                </div>
              </div>
            )}

            {/* 🔑 LOGIN PAGE */}
            {page === "login" && (
              <Login setPage={(p) => {
                if (p === "dashboard") {
                  const user = JSON.parse(localStorage.getItem("user"));
                  handleLoginSuccess(user?.role || "employee");
                } else {
                  setPage(p);
                }
              }} />
            )}

            {/* 📝 REGISTER PAGE */}
            {page === "register" && <Register setPage={setPage} />}

            {/* 🛠️ FORGOT PASSWORD */}
            {page === "forgot" && <Forgot setPage={setPage} />}
            
          </div>
        </div>
      )}

      {/* 📱 FOOTER CREDITS (Optional) */}
      {page !== "dashboard" && (
        <footer className="global-footer">
          <p>© 2026 Talent OS • Built for Efficiency</p>
        </footer>
      )}
    </div>
  );
}

export default App;