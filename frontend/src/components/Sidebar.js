import React from "react";
import "./Sidebar.css";

function Sidebar({ setTab, tab }) {
  return (
    <div className="sidebar premium-glass">
      <div className="sidebar-brand">
        <h2 className="text-gradient">🚀 Talent</h2>
      </div>

      <div className="menu-items">
        <button
          className={`sidebar-btn ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          <span className="icon">📋</span> Pending
        </button>

        <button
          className={`sidebar-btn ${tab === "completed" ? "active" : ""}`}
          onClick={() => setTab("completed")}
        >
          <span className="icon">✅</span> Completed
        </button>

        <button 
          className={`sidebar-btn ${tab === "analytics" ? "active" : ""}`}
          onClick={() => setTab("analytics")}
        >
          <span className="icon">📊</span> Analytics
        </button>
      </div>

      <div className="sidebar-footer">
        <p className="version-tag">v2.0 Premium</p>
      </div>
    </div>
  );
}

export default Sidebar;