import React, { useEffect, useState, useCallback } from "react";
import "./AdminDashboard.css";
import AllChat from "./AllChat";
import axios from "axios";

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
    total: 0, pending: 0, in_progress: 0, completed: 0, blocked: 0
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [taskFile, setTaskFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  // ✅ OVERLAY & SETTINGS STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sodLogs, setSodLogs] = useState([]);
  const [eodLogs, setEodLogs] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({
    siteName: "Talent OS",
    allowRegistration: true,
    maintenanceMode: false
  });

  const userStr = localStorage.getItem("user");
  const admin = userStr ? JSON.parse(userStr) : { email: "Admin" };

  // ================= FETCH LOGIC =================
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data);
    } catch (err) { console.error("Error fetching users:", err); }
  };

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/tasks`);
      setTasks(res.data);
      setFilteredTasks(res.data);
      calculateStats(res.data);
    } catch (err) { console.error("Error fetching tasks:", err); }
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/admin/analytics`);
      setAnalytics(res.data);
    } catch (err) { console.error("Error fetching analytics:", err); }
  };

  const fetchAttendance = async () => {
    try {
      const sod = await axios.get(`${API}/sod`);
      const eod = await axios.get(`${API}/eod`);
      setSodLogs(sod.data);
      setEodLogs(eod.data);
    } catch (err) { console.error("Attendance fetch error:", err); }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/settings`);
      if (res.data.siteName) setGlobalSettings(res.data);
    } catch (err) { console.error("Settings fetch error:", err); }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchAnalytics();
    fetchAttendance();
    fetchSettings();
  }, [fetchTasks]);

  const calculateStats = (data) => {
    const s = { total: data.length, pending: 0, in_progress: 0, completed: 0, blocked: 0 };
    data.forEach((t) => { if (s[t.status] !== undefined) s[t.status]++; });
    setStats(s);
  };

  useEffect(() => {
    let temp = [...tasks];
    if (search) temp = temp.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "all") temp = temp.filter((t) => t.status === statusFilter);
    setFilteredTasks(temp);
  }, [search, statusFilter, tasks]);

  // ================= ACTION HANDLERS =================
  const toggleEmployee = (email) => {
    setAssignedTo(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
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
    const method = editMode ? "put" : "post";

    try {
      const res = await axios({ method, url, data: formData });
      if (res.status === 200 || res.status === 201) {
        resetForm();
        fetchTasks();
        fetchAnalytics();
        alert(editMode ? "Task Updated Machi!" : "Task Assigned Successfully!");
      }
    } catch (err) { alert("Error saving task!"); }
  };

  const handleUpdateSettings = async () => {
    try {
      await axios.post(`${API}/api/admin/settings`, globalSettings);
      alert("Settings Updated, Machi!");
      setIsSettingsOpen(false);
    } catch (err) { alert("Update failed!"); }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setDueDate("");
    setAssignedTo([]); setTaskFile(null);
    setEditMode(false); setEditTaskId(null);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Kandippa delete pannunuma machi?")) return;
    await axios.delete(`${API}/delete-task/${id}`);
    fetchTasks();
  };

  const editTask = (t) => {
    setEditMode(true); setEditTaskId(t.id);
    setTitle(t.title); setDescription(t.description);
    setDueDate(t.dueDate); setAssignedTo([t.assigned_to]);
  };

  return (
    <div className="admin-dashboard-root">
      
      {/* --- HEADER --- */}
      <header className="admin-main-header glass">
        <div className="header-branding">
          <h2 className="header-title">{globalSettings.siteName} Admin</h2>
          <span className="portal-badge">Management Portal</span>
        </div>
        <div className="header-user-controls">
          <span className="welcome-text">Welcome, <strong className="admin-email">{admin.email}</strong></span>
          <div className="nav-btn-group">
             <button className="nav-action-btn" onClick={() => setIsAttendanceOpen(true)}>🕒 Attendance</button>
             <button className="nav-action-btn" onClick={() => setIsChatOpen(true)}>📢 Chat</button>
             <button className="nav-action-btn" onClick={() => setIsSettingsOpen(true)}>⚙️ Settings</button>
             <button className="btn-logout" onClick={() => setPage("login")}>Logout</button>
          </div>
        </div>
      </header>

      {/* --- STATS SECTION --- */}
      <section className="stats-grid-container">
        {['Total Tasks', 'Pending', 'In Progress', 'Completed', 'Blocked'].map((label, idx) => {
          const keys = ['total', 'pending', 'in_progress', 'completed', 'blocked'];
          return (
            <div key={idx} className={`stat-card card-${keys[idx]}`}>
              <span className="stat-label">{label}</span>
              <h3 className="stat-value">{stats[keys[idx]]}</h3>
            </div>
          );
        })}
      </section>

      {/* --- ANALYTICS --- */}
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

      {/* --- MAIN GRID --- */}
      <main className="admin-content-grid">
        {/* TASK FORM */}
        <section className="task-creation-panel glass-card">
          <h3 className="panel-title">{editMode ? "⚡ Edit Task" : "🚀 Assign New Task"}</h3>
          <div className="form-container">
            <input className="form-input-field" placeholder="Task Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <textarea className="form-textarea-field" placeholder="Detailed Description" value={description} onChange={(e)=>setDescription(e.target.value)} rows="4" />
            
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
                  <button key={u.email} type="button" className={`employee-chip ${assignedTo.includes(u.email) ? "chip-active" : ""}`} onClick={() => toggleEmployee(u.email)}>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-button-group">
              <button className="btn-primary-action" onClick={handleSubmit}>{editMode ? "Update Task" : "Confirm Assignment"}</button>
              {editMode && <button className="btn-cancel-action" onClick={resetForm}>Cancel</button>}
            </div>
          </div>
        </section>

        {/* TASK TABLE */}
        <section className="task-management-table-panel glass-card">
          <div className="table-header-controls">
            <input className="table-search-input" placeholder="🔍 Search tasks..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            <select className="table-status-filter" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="table-responsive-container">
            <table className="admin-data-table">
              <thead>
                <tr><th>Task Info</th><th>Assignee</th><th>Status</th><th>Progress</th><th>Deadline</th><th>Actions</th></tr>
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
                          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${t.progress}%` }}></div></div>
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

      {/* --- ATTENDANCE OVERLAY --- */}
      {isAttendanceOpen && (
        <div className="custom-overlay">
          <div className="modal-content-wrapper attendance-modal glass">
            <div className="modal-header">
              <h3>🕒 Real-time Attendance Logs</h3>
              <button className="close-x" onClick={() => setIsAttendanceOpen(false)}>×</button>
            </div>
            <div className="attendance-flex-container">
              <div className="log-col">
                <h4>🌅 SOD Logs</h4>
                <div className="log-scroll">
                  {sodLogs.map((log, i) => (
                    <div key={i} className="attendance-log-card sod-item">
                      <strong>{log.name}</strong><br/>
                      <small>{log.date} | {log.time}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="log-col">
                <h4>🌙 EOD Logs</h4>
                <div className="log-scroll">
                  {eodLogs.map((log, i) => (
                    <div key={i} className="attendance-log-card eod-item">
                      <strong>{log.name}</strong>
                      <p className="log-work-desc">{log.workDone}</p>
                      <div className="log-progress-mini">Progress: {log.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS OVERLAY --- */}
      {isSettingsOpen && (
        <div className="custom-overlay">
          <div className="modal-content-wrapper settings-modal glass">
            <div className="modal-header">
              <h3>⚙️ Global Settings</h3>
              <button className="close-x" onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>
            <div className="settings-body">
              <div className="setting-field">
                <label>Platform Name:</label>
                <input type="text" value={globalSettings.siteName} onChange={(e)=>setGlobalSettings({...globalSettings, siteName: e.target.value})} />
              </div>
              <div className="setting-field checkbox-field">
                <input type="checkbox" checked={globalSettings.allowRegistration} onChange={(e)=>setGlobalSettings({...globalSettings, allowRegistration: e.target.checked})} />
                <label>Allow New Registrations</label>
              </div>
              <div className="setting-field checkbox-field">
                <input type="checkbox" checked={globalSettings.maintenanceMode} onChange={(e)=>setGlobalSettings({...globalSettings, maintenanceMode: e.target.checked})} />
                <label>Maintenance Mode</label>
              </div>
              <button className="btn-primary-action mt-4" onClick={handleUpdateSettings}>Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CHAT OVERLAY --- */}
      {isChatOpen && (
        <div className="custom-overlay">
          <div className="modal-content-wrapper chat-modal glass">
            <div className="modal-header">
              <h3>📢 Announcements & Discussions</h3>
              <button className="close-x" onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <div className="chat-body">
               <AllChat />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;