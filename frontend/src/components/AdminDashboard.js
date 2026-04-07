import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  Users, CheckCircle, Clock, AlertCircle, Layout, 
  MessageSquare, Settings, LogOut, Search, Plus, Calendar, Paperclip, X,
  User, Mail, Phone, Layers, Save, Camera
} from "lucide-react";

// Importing CSS Files
import "./AdminDashboard.css";
import "./ProfileSettings.css"; 
import "./AttendanceForm.css";
import "./AllChat.css";

// Components
import AllChat from "./AllChat";

const API = "http://localhost:5000";

function AdminDashboard({ setPage }) {
  // ==========================================================
  // 1. STATES MANAGEMENT
  // ==========================================================
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0, pending: 0, in_progress: 0, completed: 0, blocked: 0
  });

  // Task Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [taskFile, setTaskFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  // Overlay / UI States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sodLogs, setSodLogs] = useState([]);
  const [eodLogs, setEodLogs] = useState([]);
  
  // Platform Settings State
  const [globalSettings, setGlobalSettings] = useState({
    siteName: "TALENT OS",
    allowRegistration: true,
    maintenanceMode: false
  });

  // ==========================================================
  // 2. PROFILE LOGIC
  // ==========================================================
  const userStr = localStorage.getItem("user");
  const adminData = userStr ? JSON.parse(userStr) : {};

  const [profileFormData, setProfileFormData] = useState({
    name: adminData.name || 'Admin',
    email: adminData.email || '',
    dob: adminData.dob || '',
    mobile: adminData.mobile || '',
    role: adminData.role || 'Admin',
    domain: adminData.domain || 'Management',
    joinedDate: adminData.joinedDate || 'N/A',
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    adminData.profile_pic 
      ? `${API}/uploads/profiles/${adminData.profile_pic}` 
      : null
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const handleProfileChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    const data = new FormData();
    data.append('email', profileFormData.email);
    data.append('name', profileFormData.name);
    data.append('dob', profileFormData.dob);
    data.append('mobile', profileFormData.mobile);
    if (profilePic) data.append('profile_pic', profilePic);

    try {
      const res = await axios.post(`${API}/api/user/profile/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        setProfileMsg({ type: 'success', text: 'Profile updated, Boss! ✅' });
        const updatedUser = { 
            ...adminData, 
            name: profileFormData.name, 
            dob: profileFormData.dob,
            mobile: profileFormData.mobile,
            profile_pic: res.data.profile_pic || adminData.profile_pic
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Refresh the preview URL if a new image was uploaded
        if(res.data.profile_pic) {
            setPreviewUrl(`${API}/uploads/profiles/${res.data.profile_pic}`);
        }
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Update failed machi! ❌' });
    } finally {
      setProfileLoading(false);
    }
  };

  // ==========================================================
  // 3. DATA FETCHING
  // ==========================================================
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

  // ==========================================================
  // 4. TASK HANDLERS
  // ==========================================================
  const toggleEmployee = (email) => {
    setAssignedTo(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const handleTaskSubmit = async () => {
    if (!title || assignedTo.length === 0) {
      alert("Machi, Title and at least one Employee is required!");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("assigned_by", adminData.email);
    assignedTo.forEach((e) => formData.append("assigned_to", e));
    if (taskFile) formData.append("task_file", taskFile);

    const url = editMode ? `${API}/update-task/${editTaskId}` : `${API}/admin/assign-task`;
    const method = editMode ? "put" : "post";

    try {
      await axios({ method, url, data: formData });
      resetTaskForm();
      fetchTasks();
      fetchAnalytics();
      alert("Task Synced Machi! 🚀");
    } catch (err) { alert("Error saving task!"); }
  };

  const resetTaskForm = () => {
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

  // ==========================================================
  // 5. RENDER UI
  // ==========================================================
  return (
    <div className="ad-root">
      
      {/* --- SIDEBAR NAV --- */}
      <nav className="ad-navbar">
        <div className="ad-nav-brand">
          <div className="ad-logo-box">
             <Layout size={22} color="white" />
          </div>
          <span>{globalSettings.siteName}</span>
        </div>

        {/* INTEGRATED ADMIN PROFILE MINI VIEW */}
        <div className="ad-admin-mini-profile" onClick={() => setIsSettingsOpen(true)}>
            <div className="ad-mini-info">
                <span className="ad-mini-name">{profileFormData.name}</span>
                <span className="ad-mini-role">System Admin</span>
            </div>
            <div className="ad-mini-avatar-container">
                {previewUrl ? (
                    <img src={previewUrl} alt="Admin" className="ad-mini-img" />
                ) : (
                    <div className="ad-mini-placeholder"><User size={16} /></div>
                )}
            </div>
        </div>

        <div className="ad-nav-links">
          <button className="ad-nav-item" onClick={() => setIsAttendanceOpen(true)}><Clock size={18} /> Attendance</button>
          <button className="ad-nav-item" onClick={() => setIsChatOpen(true)}><MessageSquare size={18} /> Team Chat</button>
          <button className="ad-nav-item" onClick={() => setIsSettingsOpen(true)}><Settings size={18} /> Settings</button>
          <div className="ad-divider"></div>
          <button className="ad-logout-btn" onClick={() => setPage("login")}><LogOut size={18} /> Logout</button>
        </div>
      </nav>

      <div className="ad-main-container">
        {/* --- STATS SECTION --- */}
        <div className="ad-stats-grid">
          <div className="ad-stat-card total">
            <div className="ad-stat-icon-bg"><Users size={22} /></div>
            <div><p>Total Tasks</p><h3>{stats.total}</h3></div>
          </div>
          <div className="ad-stat-card pending">
            <div className="ad-stat-icon-bg"><Clock size={22} /></div>
            <div><p>Pending</p><h3>{stats.pending}</h3></div>
          </div>
          <div className="ad-stat-card completed">
            <div className="ad-stat-icon-bg"><CheckCircle size={22} /></div>
            <div><p>Completed</p><h3>{stats.completed}</h3></div>
          </div>
          <div className="ad-stat-card blocked">
            <div className="ad-stat-icon-bg"><AlertCircle size={22} /></div>
            <div><p>Blocked</p><h3>{stats.blocked}</h3></div>
          </div>
        </div>

        <div className="ad-content-layout">
          {/* --- TASK FORM --- */}
          <div className="ad-form-card">
            <div className="ad-card-head">
               <h3>{editMode ? "⚡ Edit Task" : "🚀 New Assignment"}</h3>
               <p>Fill details to sync with team</p>
            </div>
            <div className="ad-form-group">
              <label className="ad-field-label">TASK TITLE</label>
              <input className="ad-input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="What needs to be done?" />
              
              <label className="ad-field-label">DESCRIPTION</label>
              <textarea className="ad-input" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Add specific instructions..." rows="3" />
              
              <div className="ad-form-row">
                <div style={{flex: 1}}>
                  <label className="ad-field-label">DEADLINE</label>
                  <input className="ad-input" type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
                </div>
                <div style={{flex: 1}}>
                   <label className="ad-field-label">ATTACHMENT</label>
                   <label className="ad-file-upload">
                    <Paperclip size={16} /> {taskFile ? taskFile.name.substring(0, 10) + '...' : "Upload File"}
                    <input type="file" hidden onChange={(e)=>setTaskFile(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <label className="ad-field-label">ASSIGN TO EMPLOYEES</label>
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
              <button className="ad-primary-btn" onClick={handleTaskSubmit}>
                {editMode ? "Update Assignment" : "Deploy Task"}
              </button>
            </div>
          </div>

          {/* --- TASK LIST --- */}
          <div className="ad-table-card">
            <div className="ad-table-header">
              <div className="ad-search-bar">
                <Search size={18} />
                <input placeholder="Search tasks..." value={search} onChange={(e)=>setSearch(e.target.value)} />
              </div>
              <select className="ad-select-filter" onChange={(e)=>setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="ad-table-wrapper">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>TASK DETAIL</th>
                    <th>ASSIGNEE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t.id} className="ad-tr">
                      <td>
                        <div className="ad-task-info">
                           <span className="ad-task-name">{t.title}</span>
                           <span className="ad-task-date">Due: {t.dueDate}</span>
                        </div>
                      </td>
                      <td><div className="ad-user-pill">{t.assigned_to}</div></td>
                      <td><span className={`ad-status-badge ${t.status}`}>{t.status}</span></td>
                      <td>
                        <div className="ad-action-group">
                          <button className="ad-edit-icon" onClick={() => editTask(t)}>Edit</button>
                          <button className="ad-del-icon" onClick={() => deleteTask(t.id)}>Delete</button>
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
        <div className="af-overlay" onClick={() => setIsAttendanceOpen(false)}>
          <div className="af-wrapper animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="af-close-btn" onClick={() => setIsAttendanceOpen(false)}>
              <X size={24} />
            </button>
            <div className="af-header">
               <div className="af-brand">
                  <div className="af-logo-icon"><Clock /></div>
                  <div>
                    <h2 className="af-title">Team Attendance</h2>
                    <p className="af-subtitle">Daily SOD & EOD Monitoring</p>
                  </div>
               </div>
            </div>
            <div className="af-grid">
               <div className="af-action-side">
                  <div className="af-time-banner">Current Activity Monitor</div>
                  <div className="af-stat-row">
                    <div className="af-mini-card af-sod-bg">
                      <span className="af-label">Morning</span>
                      <span className="af-val">{sodLogs.length} SODs</span>
                    </div>
                    <div className="af-mini-card af-eod-bg">
                      <span className="af-label">Evening</span>
                      <span className="af-val">{eodLogs.length} EODs</span>
                    </div>
                  </div>
               </div>
               <div className="af-timeline-side scrollbar-style">
                  <h4 className="af-timeline-head">Live Feed</h4>
                  <div className="af-timeline-list">
                    {sodLogs.map((log, i) => (
                      <div key={i} className="af-log-item status-sod">
                        <div className="af-log-meta">
                          <span className="af-log-name">{log.name}</span>
                          <span className="af-badge sod">SOD</span>
                        </div>
                        <div className="af-log-time">Punched in at: {log.time}</div>
                      </div>
                    ))}
                    {eodLogs.map((log, i) => (
                      <div key={i} className="af-log-item status-eod">
                        <div className="af-log-meta">
                          <span className="af-log-name">{log.name}</span>
                          <span className="af-badge eod">EOD</span>
                        </div>
                        <div className="af-log-task"><strong>Work:</strong> {log.workDone}</div>
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
        <div className="ps-root-container" onClick={() => setIsSettingsOpen(false)}>
          <div className="ps-main-card" onClick={(e) => e.stopPropagation()}>
            <button className="ps-close-x" onClick={() => setIsSettingsOpen(false)}><X /></button>
            
            <div className="ps-header-banner">
               <div className="ps-role-badge">{profileFormData.role.toUpperCase()}</div>
               <div className="ps-avatar-wrapper">
                  <div className="ps-avatar-container">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="ps-avatar-img" />
                    ) : (
                      <User size={48} className="ps-avatar-placeholder" />
                    )}
                  </div>
                  <label className="ps-camera-trigger">
                    <Camera size={18} />
                    <input type="file" hidden onChange={handleProfileFileChange} accept="image/*" />
                  </label>
               </div>
            </div>

            <div className="ps-form-content">
              <div className="ps-form-header">
                <div className="ps-title-group">
                  <h2 className="ps-main-title">Admin Profile Control</h2>
                  <p className="ps-subtitle">Customize your system identity, Machi.</p>
                </div>
              </div>

              {profileMsg.text && (
                <div className={`ps-alert ps-alert-${profileMsg.type}`}>
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="ps-form-grid">
                <div className="ps-input-row">
                  <div className="ps-input-field">
                    <label className="ps-label">Full Name</label>
                    <input type="text" name="name" value={profileFormData.name} onChange={handleProfileChange} className="ps-input-box" />
                  </div>
                  <div className="ps-input-field">
                    <label className="ps-label">Mobile Number</label>
                    <input type="text" name="mobile" value={profileFormData.mobile} onChange={handleProfileChange} className="ps-input-box" />
                  </div>
                </div>

                <div className="ps-footer-actions">
                  <button type="submit" disabled={profileLoading} className="ps-btn-submit">
                    {profileLoading ? "Syncing..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- TEAM CHAT --- */}
      {isChatOpen && (
        <div className="af-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="ac-root animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ width: '400px', height: '600px', position: 'fixed', right: '20px', bottom: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
            <div className="ac-header">
               <div className="ac-header-left">
                  <div className="ac-logo-bg"><MessageSquare size={18} /></div>
                  <div>
                     <h3 className="ac-main-title">Global Team Chat</h3>
                  </div>
               </div>
               <button className="ac-close-x" onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
               <AllChat onClose={() => setIsChatOpen(false)} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;