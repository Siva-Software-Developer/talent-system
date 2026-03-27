import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5000";

function AdminDashboard({ setPage }) {
  // 1. STATE MANAGEMENT
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // New field
  const [assignedTo, setAssignedTo] = useState([]); // Array for Multi-select
  const [taskFile, setTaskFile] = useState(null); // For PDF
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

  // 5. MULTI-SELECT HANDLER
  const handleEmployeeToggle = (email) => {
    if (assignedTo.includes(email)) {
      setAssignedTo(assignedTo.filter((e) => e !== email));
    } else {
      setAssignedTo([...assignedTo, email]);
    }
  };

  // 6. CREATE TASK LOGIC (MULTIPART FOR PDF)
  const handleCreateTask = async () => {
    if (!title || assignedTo.length === 0) {
      alert("Machi, Title and at least one Employee select pannunga!");
      return;
    }

    setLoading(true);

    // Using FormData to handle file upload
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate || "No Deadline");
    formData.append("assigned_by", admin.email);
    
    // Appending multiple emails
    assignedTo.forEach((email) => {
      formData.append("assigned_to", email);
    });

    if (taskFile) {
      formData.append("task_file", taskFile);
    }

    try {
      const response = await fetch(`${API}/admin/assign-task`, {
        method: "POST",
        body: formData, // No Headers needed, browser sets multipart
      });

      const result = await response.json();
      alert(result.message);

      // Refreshing lists
      await fetchAllTasks();

      // Reset Form fields
      setTitle("");
      setDescription("");
      setDueDate("");
      setAssignedTo([]);
      setTaskFile(null);
      // Reset file input manually
      document.getElementById("fileInput").value = "";

    } catch (error) {
      alert("Failed to assign task. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // 7. RENDER LOGIC
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

      <div className="admin-grid-layout">
        {/* CREATE TASK FORM SECTION */}
        <div className="task-form-section premium-glass">
          <h3>📌 Task Assignment Panel</h3>
          <div className="input-group">
            <input
              className="admin-input"
              type="text"
              placeholder="Assign Task Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="admin-input"
              placeholder="Write Task Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />

            <div className="form-row">
              <input
                className="admin-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <div className="file-upload-btn">
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setTaskFile(e.target.files[0])}
                />
                <label htmlFor="fileInput">
                  {taskFile ? "📄 PDF Attached" : "📁 Upload PDF Task"}
                </label>
              </div>
            </div>

            {/* MULTI-SELECT EMPLOYEE LIST */}
            <div className="multi-assign-box">
              <p>Select Employees (Multi-Assign):</p>
              <div className="employee-selection-list">
                {users
                  .filter((u) => u.role === "employee")
                  .map((u) => (
                    <div 
                      key={u.email} 
                      className={`emp-option ${assignedTo.includes(u.email) ? "selected" : ""}`}
                      onClick={() => handleEmployeeToggle(u.email)}
                    >
                      {u.name}
                    </div>
                  ))}
              </div>
            </div>

            <button 
              className="assign-btn" 
              onClick={handleCreateTask}
              disabled={loading}
            >
              {loading ? "Processing..." : `ASSIGN TO ${assignedTo.length} EMPLOYEES`}
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="stats-section">
            <div className="stat-card">
                <span>Total Tasks</span>
                <h3>{tasks.length}</h3>
            </div>
            <div className="stat-card">
                <span>Completed</span>
                <h3 style={{color: '#10b981'}}>{tasks.filter(t => t.status === 'completed').length}</h3>
            </div>
        </div>
      </div>

      {/* ACTIVE TASKS GRID & TRACKING */}
      <h3 className="section-title">📊 Real-time Task Status Tracking</h3>
      <div className="admin-tasks-table-wrapper">
        <table className="admin-tasks-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Proof / Links</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map((t) => (
                    <tr key={t.id}>
                        <td><strong>{t.title}</strong></td>
                        <td>{t.assigned_to}</td>
                        <td><span className={`status-pill ${t.status}`}>{t.status}</span></td>
                        <td>{t.dueDate}</td>
                        <td>
                            {t.status === 'completed' ? (
                                <div className="links-group">
                                    <a href={t.proof_link} target="_blank" rel="noreferrer">Proof</a>
                                    <a href={t.github_link} target="_blank" rel="noreferrer">GitHub</a>
                                </div>
                            ) : "Awaiting..."}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;