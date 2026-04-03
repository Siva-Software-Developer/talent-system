import React, { useState, useEffect } from "react";
import "./App.css";

// 📂 AUTH COMPONENTS
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";

// 📂 DASHBOARD COMPONENTS
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";

// 📂 ICONS
import { Moon, Sun, Palette, Rocket, Users, ShieldCheck } from "lucide-react";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);

  // 🛠️ THEME & SESSION INITIALIZATION
  useEffect(() => {
    // Apply Global Theme
    document.body.className = theme;

    // Apply Global Primary Color
    const savedColor = localStorage.getItem("themeColor") || "#6366f1";
    applyColor(savedColor);

    // 🔄 SESSION CHECK (Auto-Login)
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
      setRole(savedUser.role);
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
    setUser(null);
    setPage("home");
  };

  // 🔄 LOGIN SUCCESS HANDLER
  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setRole(userData.role);
    setIsLoggedIn(true);
    setPage("dashboard");
  };

  return (
    <div className={`app-root-container ${theme} ${(isLoggedIn && page === "dashboard") ? "layout-dashboard" : "layout-auth"}`}>
      
      {/* 🎨 FLOATING GLOBAL CONTROLS */}
      <div className="global-controls-glass">
        <button className="ctrl-theme-btn" onClick={toggleTheme} title="Toggle Mode">
          {theme === "dark" ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#1e293b" />}
        </button>
        
        <div className="ctrl-color-picker-wrapper">
          <Palette size={18} className="palette-icon" />
          <input
            type="color"
            className="ctrl-color-input"
            defaultValue={localStorage.getItem("themeColor") || "#6366f1"}
            onChange={(e) => applyColor(e.target.value)}
            title="Customize Theme Color"
          />
        </div>
      </div>

      {/* ✅ MAIN ROUTING LOGIC */}
      {isLoggedIn && page === "dashboard" ? (
        <div className="dashboard-view-wrapper animate-fade-in">
          {role === "admin" ? (
            <AdminDashboard 
              user={user} 
              onLogout={handleLogout} 
              setPage={(p) => p === "login" ? handleLogout() : setPage(p)} 
            />
          ) : (
            <Dashboard 
              user={user} 
              onLogout={handleLogout} 
              setPage={(p) => p === "login" ? handleLogout() : setPage(p)} 
            />
          )}
        </div>
      ) : (
        /* 🔐 AUTH SCREENS (Home, Login, Register, Forgot) */
        <div className="auth-screen-overlay">
          <div className="auth-container-centered">
            
            {/* 🏠 HOME HERO */}
            {page === "home" && (
              <div className="home-hero-content animate-slide-up">
                <div className="hero-logo-box">
                  <Rocket size={48} className="hero-icon-rocket" />
                </div>
                <h1 className="brand-logo-text">Talent OS</h1>
                <p className="brand-tagline">Streamlining professional workflows with AI-driven intelligence.</p>
                <div className="home-action-btns">
                  <button className="btn-primary-glow" onClick={() => setPage("login")}>
                    <ShieldCheck size={20} /> Access Portal
                  </button>
                  <button className="btn-secondary-outline" onClick={() => setPage("register")}>
                    <Users size={20} /> Join Team
                  </button>
                </div>
              </div>
            )}

            {/* 🔑 LOGIN PAGE */}
            {page === "login" && (
              <Login setPage={(p) => {
                if (p === "dashboard") {
                  const user = JSON.parse(localStorage.getItem("user"));
                  handleLoginSuccess(user);
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

      {/* 📱 FOOTER CREDITS */}
      {(!isLoggedIn || page !== "dashboard") && (
        <footer className="global-footer">
          <p>© 2026 <span>Talent OS</span> • Built for Efficiency</p>
        </footer>
      )}
    </div>
  );
}

export default App;