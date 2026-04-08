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
import { Moon, Sun, UserPlus, ShieldCheck, Briefcase } from "lucide-react";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(localStorage.getItem("dtms-theme") || "light");
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);

  // ✅ LOGIN STATUS
  const isLoggedIn = !!user;

  // 🛠️ INITIAL LOAD (FIXED)
  useEffect(() => {
    document.body.className = `dtms-theme-${theme}`;

    const savedUser = localStorage.getItem("dtms_user");

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);

        if (parsed && parsed.email) {
          setUser(parsed);
          setRole(parsed.role || "employee");
          setPage("dashboard");
        }
      } catch (e) {
        console.error("User parse error", e);
        setPage("login");
      }
    }
  }, []); // 🔥 FIXED (removed theme dependency)

  // 🌓 THEME TOGGLE
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("dtms-theme", newTheme);
    document.body.className = `dtms-theme-${newTheme}`;
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("dtms_user");
    setUser(null);
    setRole("");
    setPage("home");
  };

  return (
    <div className={`dtms-app-root ${theme}`}>
      
      {/* 🌓 THEME TOGGLE */}
      <div className="dtms-system-controls">
        <button className="dtms-theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* ✅ DASHBOARD VIEW */}
      {isLoggedIn && page === "dashboard" ? (
        <div className="dtms-dashboard-view animate-fade-in">
          {role?.toLowerCase() === "admin" ? (   // 🔥 FIXED ROLE CHECK
            <AdminDashboard 
              user={user} 
              onLogout={handleLogout} 
              setPage={setPage} 
            />
          ) : (
            <Dashboard 
              user={user} 
              onLogout={handleLogout} 
              setPage={setPage} 
            />
          )}
        </div>
      ) : (
        <div className="dtms-auth-layer">
          <div className="dtms-auth-centered">
            
            {/* 🏠 HOME */}
            {page === "home" && (
              <div className="dtms-hero-content animate-fade-in">
                <div className="dtms-hero-icon-box">
                  <Briefcase size={48} strokeWidth={1.5} />
                </div>
                <h1 className="dtms-hero-title">Digital Talent Management System</h1>
                <p className="dtms-hero-subtitle">
                  Enterprise-grade infrastructure for modern workforce optimization and talent tracking.
                </p>
                
                <div className="dtms-hero-actions">
                  <button className="dtms-btn-primary" onClick={() => setPage("login")}>
                    <ShieldCheck size={18} /> SYSTEM ACCESS
                  </button>
                  <button className="dtms-btn-outline" onClick={() => setPage("register")}>
                    <UserPlus size={18} /> EMPLOYEE ONBOARDING
                  </button>
                </div>
              </div>
            )}

            {/* 🔑 LOGIN (FIXED) */}
            {page === "login" && (
              <Login setPage={(p) => {
                if (p === "dashboard") {
                  const userData = JSON.parse(localStorage.getItem("dtms_user"));

                  if (userData && userData.email) {
                    setUser(userData); // 🔥 IMPORTANT FIX
                    setRole(userData.role || "employee");
                    setPage("dashboard");
                  } else {
                    alert("Login failed 😢");
                  }
                } else {
                  setPage(p);
                }
              }} />
            )}

            {/* 📝 REGISTER */}
            {page === "register" && <Register setPage={setPage} />}

            {/* 🛠️ FORGOT */}
            {page === "forgot" && <Forgot setPage={setPage} />}
            
          </div>
        </div>
      )}

      {/* 📱 FOOTER */}
      {(!isLoggedIn || page !== "dashboard") && (
        <footer className="dtms-global-footer">
          <p>© 2026 <strong>DTMS</strong> Infrastructure • Secure Talent Ecosystem</p>
        </footer>
      )}
    </div>
  );
}

export default App;