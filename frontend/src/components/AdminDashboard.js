import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5000";

function AdminDashboard({ setPage }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [taskFile, setTaskFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const userStr = localStorage.getItem("user");
  const admin = userStr ? JSON.parse(userStr) : { email: "Unknown Admin" };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const response = await fetch(`${API}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllTasks();
  }, []);

  const handleEmployeeToggle = (email) => {
    if (assignedTo.includes(email)) {
      setAssignedTo(assignedTo.filter((e) => e !== email));
    } else {
      setAssignedTo([...assignedTo, email]);
    }
  };

  const handleCreateTask = async () => {
    if (!title || assignedTo.length === 0) {
      alert("Select at least one employee machi!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate || "No Deadline");
    formData.append("assigned_by", admin.email);

    assignedTo.forEach((email) => {
      formData.append("assigned_to", email);
    });

    if (taskFile) {
      formData.append("task_file", taskFile);
    }

    try {
      const response = await fetch(`${API}/admin/assign-task`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      alert(result.message);

      await fetchAllTasks();

      setTitle("");
      setDescription("");
      setDueDate("");
      setAssignedTo([]);
      setTaskFile(null);
      document.getElementById("fileInput").value = "";

    } catch (error) {
      alert("Server error da machi!");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE FUNCTION
  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm("Delete this task ah?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API}/delete-task/${taskId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Deleted successfully da machi ✅");
        fetchAllTasks();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const employeeUsers = users.filter(
    (u) => !u.role || u.role.toLowerCase() === "employee"
  );

  return (
    <div className="admin-container">
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

            <div className="multi-assign-box">
              <p>Select Employees (Multi-Assign):</p>

              <div className="employee-selection-list">
                {employeeUsers.length === 0 ? (
                  <p>No employees found 😅</p>
                ) : (
                  employeeUsers.map((u) => (
                    <div
                      key={u.email}
                      className={`emp-option ${
                        assignedTo.includes(u.email) ? "selected" : ""
                      }`}
                      onClick={() => handleEmployeeToggle(u.email)}
                    >
                      {u.name} ({u.email})
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              className="assign-btn"
              onClick={handleCreateTask}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : `ASSIGN TO ${assignedTo.length} EMPLOYEES`}
            </button>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <span>Total Tasks</span>
            <h3>{tasks.length}</h3>
          </div>
          <div className="stat-card">
            <span>Completed</span>
            <h3 style={{ color: "#10b981" }}>
              {tasks.filter((t) => t.status === "completed").length}
            </h3>
          </div>
        </div>
      </div>

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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.title}</strong></td>
                <td>{t.assigned_to}</td>
                <td>
                  <span className={`status-pill ${t.status}`}>
                    {t.status}
                  </span>
                </td>
                <td>{t.dueDate}</td>
                <td>
                  {t.status === "completed" ? (
                    <>
                      <a href={t.proof_link}>Proof</a>
                      <a href={t.github_link}>GitHub</a>
                    </>
                  ) : "Awaiting..."}
                </td>
                <td>
                  <button onClick={() => handleDelete(t.id)}>
                    ❌ Delete
                  </button>
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