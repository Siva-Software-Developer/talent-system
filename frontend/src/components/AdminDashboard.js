import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

// ✅ NEW IMPORT
import AllChat from "./AllChat";

const API = "http://localhost:5000";

function AdminDashboard({ setPage }) {
  // ================= STATES =================
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    blocked: 0
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [taskFile, setTaskFile] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  // ✅ NEW STATES (Attendance)
  const [sodLogs, setSodLogs] = useState([]);
  const [eodLogs, setEodLogs] = useState([]);

  const userStr = localStorage.getItem("user");
  const admin = userStr ? JSON.parse(userStr) : { email: "Admin" };

  // ================= FETCH DATA =================
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) { console.error("Error fetching users:", err); }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(data);
      setFilteredTasks(data);
      calculateStats(data);
    } catch (err) { console.error("Error fetching tasks:", err); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API}/admin/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) { console.error("Error fetching analytics:", err); }
  };

  const fetchAttendance = async () => {
    try {
      const sod = await fetch(`${API}/sod`).then(res => res.json());
      const eod = await fetch(`${API}/eod`).then(res => res.json());
      setSodLogs(sod);
      setEodLogs(eod);
    } catch (err) {
      console.error("Attendance fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchAnalytics();
    fetchAttendance();
  }, []);

  // ================= STATS LOGIC =================
  const calculateStats = (data) => {
    const s = { total: data.length, pending: 0, in_progress: 0, completed: 0, blocked: 0 };
    data.forEach((t) => {
      if (s[t.status] !== undefined) s[t.status]++;
    });
    setStats(s);
  };

  // ================= FILTER LOGIC =================
  useEffect(() => {
    let temp = [...tasks];
    if (search) {
      temp = temp.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== "all") {
      temp = temp.filter((t) => t.status === statusFilter);
    }
    setFilteredTasks(temp);
  }, [search, statusFilter, tasks]);

  // ================= ACTIONS =================
  const toggleEmployee = (email) => {
    setAssignedTo(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSubmit = async () => {
    if (!title || assignedTo.length === 0) {
      alert("Machi, Title and at least one Employee is required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("assigned_by", admin.email);

    assignedTo.forEach((e) => formData.append("assigned_to", e));
    if (taskFile) formData.append("task_file", taskFile);

    const url = editMode ? `${API}/update-task/${editTaskId}` : `${API}/admin/assign-task`;
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        resetForm();
        fetchTasks();
        fetchAnalytics();
        alert(editMode ? "Task Updated Machi!" : "Task Assigned Successfully!");
      }
    } catch (err) { alert("Error saving task!"); }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setDueDate("");
    setAssignedTo([]); setTaskFile(null);
    setEditMode(false); setEditTaskId(null);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Kandippa delete pannunuma machi?")) return;
    await fetch(`${API}/delete-task/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const editTask = (t) => {
    setEditMode(true);
    setEditTaskId(t.id);
    setTitle(t.title);
    setDescription(t.description);
    setDueDate(t.dueDate);
    setAssignedTo([t.assigned_to]);
  };

  return (
    <div className="admin-dashboard-root">
      
      {/* CHAT OVERLAY */}
      <div className="admin-chat-wrapper">
        <AllChat />
      </div>

      {/* HEADER SECTION */}
      <header className="admin-main-header">
        <div className="header-branding">
          <h2 className="header-title">Admin Dashboard</h2>
          <span className="portal-badge">Management Portal</span>
        </div>
        <div className="header-user-controls">
          <span className="welcome-text">Welcome, <strong className="admin-email">{admin.email}</strong></span>
          <button className="btn-logout" onClick={() => setPage("login")}>Logout</button>
        </div>
      </header>

      {/* STATISTICS CARDS */}
      <section className="stats-grid-container">
        <div className="stat-card card-total">
          <span className="stat-label">Total Tasks</span>
          <h3 className="stat-value">{stats.total}</h3>
        </div>
        <div className="stat-card card-pending">
          <span className="stat-label">Pending</span>
          <h3 className="stat-value">{stats.pending}</h3>
        </div>
        <div className="stat-card card-progress">
          <span className="stat-label">In Progress</span>
          <h3 className="stat-value">{stats.in_progress}</h3>
        </div>
        <div className="stat-card card-completed">
          <span className="stat-label">Completed</span>
          <h3 className="stat-value">{stats.completed}</h3>
        </div>
        <div className="stat-card card-blocked">
          <span className="stat-label">Blocked</span>
          <h3 className="stat-value">{stats.blocked}</h3>
        </div>
      </section>

      {/* ANALYTICS STRIP */}
      <div className="analytics-summary-bar">
        <div className="analytic-box">
          <span className="analytic-label">Completion Rate:</span>
          <span className="analytic-number">{analytics.completion_rate?.toFixed(2)}%</span>
        </div>
        <div className="analytic-box">
          <span className="analytic-label">Avg Progress:</span>
          <span className="analytic-number">{analytics.average_progress?.toFixed(2)}%</span>
        </div>
      </div>

      {/* ATTENDANCE SECTION */}
      <section className="attendance-monitoring-section">
        <h3 className="section-heading">🕒 Attendance Logs</h3>
        
        <div className="attendance-flex-container">
          <div className="sod-log-column">
            <h4 className="log-subheading">🌅 SOD Logs (Start of Day)</h4>
            <div className="log-list-wrapper">
              {sodLogs.map((log, i) => (
                <div key={i} className="attendance-log-card sod-item">
                  <span className="log-user">{log.name}</span>
                  <span className="log-id">ID: {log.employeeId}</span>
                  <span className="log-timestamp">{log.date} | {log.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="eod-log-column">
            <h4 className="log-subheading">🌙 EOD Logs (End of Day)</h4>
            <div className="log-list-wrapper">
              {eodLogs.map((log, i) => (
                <div key={i} className="attendance-log-card eod-item">
                  <span className="log-user">{log.name}</span>
                  <p className="log-work-desc"><strong>Work:</strong> {log.workDone}</p>
                  <div className="log-progress-mini">
                    <span>Progress: {log.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <main className="admin-content-grid">

        {/* TASK CREATION FORM */}
        <section className="task-creation-panel">
          <h3 className="panel-title">{editMode ? "⚡ Edit Task" : "🚀 Assign New Task"}</h3>
          <div className="form-container">
            <input 
              className="form-input-field" 
              placeholder="Task Title" 
              value={title} 
              onChange={(e)=>setTitle(e.target.value)} 
            />
            <textarea 
              className="form-textarea-field" 
              placeholder="Detailed Description" 
              value={description} 
              onChange={(e)=>setDescription(e.target.value)} 
              rows="4" 
            />
            
            <div className="form-split-row">
              <div className="date-input-wrapper">
                <label>Due Date:</label>
                <input type="date" className="form-date-picker" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
              </div>
              <div className="file-upload-wrapper">
                <input type="file" className="hidden-file-input" onChange={(e)=>setTaskFile(e.target.files[0])} id="admin-file-input" />
                <label htmlFor="admin-file-input" className="file-upload-label">
                  {taskFile ? `✅ ${taskFile.name}` : "📁 Attachment"}
                </label>
              </div>
            </div>

            <div className="employee-selection-panel">
              <p className="selection-label">Select Employees:</p>
              <div className="employee-chips-container">
                {users.map((u) => (
                  <button 
                    key={u.email} 
                    type="button"
                    className={`employee-chip ${assignedTo.includes(u.email) ? "chip-active" : ""}`} 
                    onClick={() => toggleEmployee(u.email)}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-button-group">
              <button className="btn-primary-action" onClick={handleSubmit}>
                {editMode ? "Update Task" : "Confirm Assignment"}
              </button>
              {editMode && <button className="btn-cancel-action" onClick={resetForm}>Cancel</button>}
            </div>
          </div>
        </section>

        {/* TASK TABLE SECTION */}
        <section className="task-management-table-panel">
          <div className="table-header-controls">
            <div className="search-wrapper">
              <input 
                className="table-search-input" 
                placeholder="🔍 Search tasks..." 
                value={search} 
                onChange={(e)=>setSearch(e.target.value)} 
              />
            </div>
            <div className="filter-wrapper">
              <select className="table-status-filter" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="table-responsive-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Task Info</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const isOverdue = new Date() > new Date(t.dueDate) && t.status !== "completed";
                  return (
                    <tr key={t.id} className="table-row-hover">
                      <td className="task-title-cell">
                        <span className="task-main-title">{t.title}</span>
                        {isOverdue && <span className="badge-overdue">Overdue</span>}
                      </td>
                      <td className="task-assignee-cell">{t.assigned_to}</td>
                      <td><span className={`status-tag tag-${t.status}`}>{t.status}</span></td>
                      <td>
                        <div className="table-progress-container">
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${t.progress}%` }}></div>
                          </div>
                          <span className="progress-text">{t.progress}%</span>
                        </div>
                      </td>
                      <td className="task-date-cell">{t.dueDate}</td>
                      <td className="task-action-btns">
                        <button className="btn-edit-small" onClick={() => editTask(t)}>Edit</button>
                        <button className="btn-delete-small" onClick={() => deleteTask(t.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;