import React, { useEffect, useState, useCallback } from "react";
import "./AdminDashboard.css";
import AllChat from "./AllChat";
import axios from "axios";
import { 
  Users, CheckCircle, Clock, AlertCircle, Layout, 
  MessageSquare, Settings, LogOut, Search, Plus, Calendar, Paperclip 
} from "lucide-react";

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

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchAnalytics();
    fetchAttendance();
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
      await axios({ method, url, data: formData });
      resetForm();
      fetchTasks();
      fetchAnalytics();
      alert("Action Successful Machi!");
    } catch (err) { alert("Error saving task!"); }
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
    <div className="ad-root">
      
      {/* --- SIDEBAR NAV --- */}
      <nav className="ad-navbar">
        <div className="ad-nav-brand">
          <Layout size={24} className="ad-accent-text" />
          <span>{globalSettings.siteName}</span>
        </div>
        <div className="ad-nav-links">
          <button onClick={() => setIsAttendanceOpen(true)}><Clock size={18} /> Attendance</button>
          <button onClick={() => setIsChatOpen(true)}><MessageSquare size={18} /> Chat</button>
          <button onClick={() => setIsSettingsOpen(true)}><Settings size={18} /> Settings</button>
          <button className="ad-logout-btn" onClick={() => setPage("login")}><LogOut size={18} /> Logout</button>
        </div>
      </nav>

      <div className="ad-main-container">
        {/* --- STATS SECTION --- */}
        <div className="ad-stats-grid">
          <div className="ad-stat-card">
            <Users size={20} className="ad-icon-total" />
            <div><p>Total Tasks</p><h3>{stats.total}</h3></div>
          </div>
          <div className="ad-stat-card">
            <Clock size={20} className="ad-icon-pending" />
            <div><p>Pending</p><h3>{stats.pending}</h3></div>
          </div>
          <div className="ad-stat-card">
            <CheckCircle size={20} className="ad-icon-done" />
            <div><p>Completed</p><h3>{stats.completed}</h3></div>
          </div>
          <div className="ad-stat-card">
            <AlertCircle size={20} className="ad-icon-blocked" />
            <div><p>Blocked</p><h3>{stats.blocked}</h3></div>
          </div>
        </div>

        <div className="ad-content-layout">
          {/* --- TASK FORM --- */}
          <div className="ad-form-card">
            <h3>{editMode ? "⚡ Edit Task" : "🚀 Assign New Task"}</h3>
            <div className="ad-form-group">
              <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Task Title" />
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" rows="3" />
              <div className="ad-form-row">
                <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
                <label className="ad-file-btn">
                  <Paperclip size={14} /> {taskFile ? "Added" : "File"}
                  <input type="file" hidden onChange={(e)=>setTaskFile(e.target.files[0])} />
                </label>
              </div>
              <p className="ad-label-sm">Assign to:</p>
              <div className="ad-chip-grid">
                {users.map(u => (
                  <button 
                    key={u.email} 
                    className={`ad-chip ${assignedTo.includes(u.email) ? 'active' : ''}`}
                    onClick={() => toggleEmployee(u.email)}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
              <button className="ad-submit-btn" onClick={handleSubmit}>
                {editMode ? "Update" : "Assign Task"}
              </button>
            </div>
          </div>

          {/* --- TASK LIST --- */}
          <div className="ad-table-card">
            <div className="ad-table-header">
              <div className="ad-search-box">
                <Search size={16} />
                <input placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} />
              </div>
              <select onChange={(e)=>setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="ad-table-wrapper">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t.id}>
                      <td><div className="ad-task-title">{t.title}</div></td>
                      <td className="ad-user-cell">{t.assigned_to}</td>
                      <td><span className={`ad-status ad-status-${t.status}`}>{t.status}</span></td>
                      <td>
                        <div className="ad-action-btns">
                          <button onClick={() => editTask(t)}>Edit</button>
                          <button onClick={() => deleteTask(t.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- ATTENDANCE OVERLAY --- */}
      {isAttendanceOpen && (
        <div className="ad-overlay">
          <div className="ad-modal ad-modal-wide animate-pop">
            <div className="ad-modal-header">
              <h3>🕒 Attendance Logs</h3>
              <button onClick={() => setIsAttendanceOpen(false)}>×</button>
            </div>
            <div className="ad-attendance-grid">
              <div className="ad-log-col">
                <h4>🌅 SOD</h4>
                {sodLogs.map((log, i) => (
                  <div key={i} className="ad-log-item">
                    <strong>{log.name}</strong> <span>{log.time}</span>
                  </div>
                ))}
              </div>
              <div className="ad-log-col">
                <h4>🌙 EOD</h4>
                {eodLogs.map((log, i) => (
                  <div key={i} className="ad-log-item">
                    <strong>{log.name}</strong> <p>{log.workDone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS OVERLAY --- */}
      {isSettingsOpen && (
        <div className="ad-overlay">
          <div className="ad-modal animate-pop">
            <div className="ad-modal-header">
              <h3>⚙️ Platform Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>
            <div className="ad-settings-body">
              <label>Site Name</label>
              <input value={globalSettings.siteName} onChange={(e)=>setGlobalSettings({...globalSettings, siteName: e.target.value})} />
              <button className="ad-submit-btn" onClick={() => setIsSettingsOpen(false)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CHAT OVERLAY --- */}
      {isChatOpen && (
        <div className="ad-overlay">
          <div className="ad-modal ad-chat-modal animate-pop">
            <div className="ad-modal-header">
              <h3>📢 Team Chat</h3>
              <button onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <div className="ad-chat-body">
              <AllChat />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;