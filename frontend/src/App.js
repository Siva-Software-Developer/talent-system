import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // 🆕 LOGIN STATE
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🆕 TASK STATE
  const [tasks, setTasks] = useState([]);

  // APPLY THEME + LOAD SAVED COLOR
  useEffect(() => {
    document.body.className = theme;

    const savedColor = localStorage.getItem("themeColor");
    if (savedColor) {
      applyColor(savedColor);
    }
  }, [theme]);

  // 🆕 FETCH TASKS ONLY AFTER LOGIN
  useEffect(() => {
    if (isLoggedIn) {
      fetch("http://127.0.0.1:5000/tasks")
        .then((res) => res.json())
        .then((data) => setTasks(data))
        .catch((err) => console.log(err));
    }
  }, [isLoggedIn]);

  // 🌙 TOGGLE THEME
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // 🎨 APPLY COLOR
  const applyColor = (color) => {
    document.documentElement.style.setProperty("--secondary", color);
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--primary", color);

    localStorage.setItem("themeColor", color);
  };

  return (
    <div className="main">

      {/* 🔥 FLOATING TOP RIGHT PANEL */}
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
              if (p === "home") {
                setIsLoggedIn(true);   // ✅ LOGIN SUCCESS
                setPage("dashboard"); // 👉 redirect to dashboard
              } else {
                setPage(p);
              }
            }}
          />
        )}

        {/* 📝 REGISTER */}
        {page === "register" && <Register setPage={setPage} />}

        {/* 🔁 FORGOT */}
        {page === "forgot" && <Forgot setPage={setPage} />}

        {/* 🆕 DASHBOARD (ONLY AFTER LOGIN) */}
        {page === "dashboard" && isLoggedIn && (
          <>
            <h2>📊 Dashboard</h2>

            {tasks.length === 0 ? (
              <p>No tasks available</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "10px",
                    textAlign: "left"
                  }}
                >
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                  <p>Status: {task.status}</p>
                  <p>Due: {task.dueDate}</p>
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default App;