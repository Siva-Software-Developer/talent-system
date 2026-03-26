import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5000";

function AdminDashboard({ setPage }) {
  // 1. STATE MANAGEMENT
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. GET LOGGED-IN ADMIN INFO
  const userStr = localStorage.getItem("user");
  const admin = userStr ? JSON.parse(userStr) : { email: "Unknown Admin" };

  // 3. FETCH DATA FUNCTIONS
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const response = await fetch(`${API}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Task Fetch Error:", err);
    }
  };

  // 4. LOAD INITIAL DATA
  useEffect(() => {
    fetchAllUsers();
    fetchAllTasks();
  }, []);

  // 5. CREATE TASK LOGIC
  const handleCreateTask = async () => {
    if (!title || !assignedTo) {
      alert("Validation Error: Please provide both Title and Employee");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/admin/create-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          description: description,
          assigned_to: assignedTo,
          assigned_by: admin.email,
        }),
      });

      const result = await response.json();
      alert(result.message);

      // Refreshing lists
      await fetchAllTasks();

      // Reset Form fields
      setTitle("");
      setDescription("");
      setAssignedTo("");
    } catch (error) {
      alert("Failed to assign task. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // 6. RENDER LOGIC
  return (
    <div className="admin-container">
      {/* HEADER SECTION */}
      <div className="admin-header">
        <h2>👑 Admin Management Portal</h2>
        <div className="header-actions">
          <span className="admin-badge">{admin.email}</span>
          <button className="logout-btn" onClick={() => setPage("login")}>
            Sign Out
          </button>
        </div>
      </div>

      {/* CREATE TASK FORM SECTION */}
      <div className="task-form-section">
        <h3>📌 Task Assignment Panel</h3>
        <div className="input-group">
          <input
            className="admin-input"
            type="text"
            placeholder="Assign Task Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="admin-input"
            type="text"
            placeholder="Write Task Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* DYNAMIC DROPDOWN FIX */}
          <select
            className="admin-select"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">-- Choose Employee --</option>
            {users
              .filter((u) => u.role === "employee")
              .map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name} ({u.job || "Member"})
                </option>
              ))}
          </select>

          <button 
            className="assign-btn" 
            onClick={handleCreateTask}
            disabled={loading}
          >
            {loading ? "Processing..." : "ASSIGN TASK NOW"}
          </button>
        </div>
      </div>

      {/* USER LIST SECTION */}
      <div className="users-section">
        <h3>👥 Registered Talent Network</h3>
        <div className="user-list-wrapper">
          {users.map((u) => (
            <span key={u.email} className={`user-tag role-${u.role}`}>
              <strong>{u.name}</strong> • {u.job || u.role}
            </span>
          ))}
        </div>
      </div>

      {/* ACTIVE TASKS GRID */}
      <h3>📋 System Task Overview</h3>
      <div className="tasks-grid">
        {tasks.length > 0 ? (
          tasks.map((t) => (
            <div key={t.id} className="task-card">
              <div className="card-header">
                <h4>{t.title}</h4>
                <span className={`status-badge status-${t.status}`}>
                  {t.status}
                </span>
              </div>
              <p className="task-desc">{t.description}</p>
              <div className="task-footer">
                <div className="footer-item">
                  <strong>Assignee:</strong> {t.assigned_to}
                </div>
                <div className="footer-item">
                  <strong>Reporter:</strong> {t.assigned_by}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No tasks found in the database.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;