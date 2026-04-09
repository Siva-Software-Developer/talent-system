import React, { useEffect, useState, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Bell, LogOut, MessageSquare, Calendar, HelpCircle,
  Clock, CheckCircle, ChevronRight, Loader2, X, Target, Settings, User
} from "lucide-react";

import { getAllTasks } from "../services/api";

import AllChat from "./AllChat";
import AttendanceForm from "./AttendanceForm";
import ProgressUpdateModal from "./ProgressUpdateModal";
import HelpSupport from "./HelpSupport";
import ProfileSettings from "./ProfileSettings";

import "./Dashboard.css";

function Dashboard({ setPage, user: appUser, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(appUser || null);
  const [tab, setTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const prevTaskCountRef = useRef(0);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ===== FETCH TASKS (Preserved Logic) =====
  const fetchTasks = useCallback(async (currentUser) => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    try {
      const res = await getAllTasks();
      const data = res?.data || [];

      const myTasks = data.filter(
        (t) =>
          t.assigned_to?.toLowerCase() ===
          currentUser.email?.toLowerCase()
      );

      if (myTasks.length > prevTaskCountRef.current && prevTaskCountRef.current !== 0) {
        const newCount = myTasks.length - prevTaskCountRef.current;
        const msg = `${newCount} new task assigned 🚀`;
        setNotifications((prev) => [msg, ...prev]);

        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n !== msg));
        }, 4000);
      }

      prevTaskCountRef.current = myTasks.length;
      setTasks(myTasks);
    } catch (err) {
      console.error("Task fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== INIT (Preserved Logic) =====
  useEffect(() => {
    let storedUser = appUser;

    if (!storedUser) {
      const raw = localStorage.getItem("dtms_user");
      try {
        storedUser = raw ? JSON.parse(raw) : null;
      } catch {
        storedUser = null;
      }
    }

    if (!storedUser?.email) {
      setPage("login");
      return;
    }

    setUser(storedUser);
    fetchTasks(storedUser);

    const interval = setInterval(() => {
      fetchTasks(storedUser);
    }, 15000);

    return () => clearInterval(interval);
  }, [appUser, fetchTasks, setPage]);

  // ===== PROFILE UPDATE HANDLER =====
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("dtms_user", JSON.stringify(updatedUser));
    setIsProfileOpen(false);
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    if (window.confirm("Do you want to logout?")) {
      if (onLogout) onLogout();
      else {
        localStorage.removeItem("dtms_user");
        setPage("login");
      }
    }
  };

  // ===== FILTER LOGIC =====
  const pending = tasks.filter(t => ["pending", "todo"].includes(t.status?.toLowerCase()));
  const progress = tasks.filter(t => t.status?.toLowerCase() === "in_progress");
  const done = tasks.filter(t => t.status?.toLowerCase() === "completed");

  const chartData = [
    { name: "Pending", value: pending.length, color: "#6366f1" },
    { name: "Progress", value: progress.length, color: "#f59e0b" },
    { name: "Done", value: done.length, color: "#10b981" }
  ];

  if (loading) {
    return (
      <div className="db-loader">
        <Loader2 className="db-spinner" size={40} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // 🔥 FIXED MODAL PORTAL: Scrollable & Static X Button 🔥
  const ModalPortal = ({ isOpen, onClose, children, showClose = true }) => {
    if (!isOpen) return null;
    return (
      <div className="db-modal-overlay" onClick={onClose} style={{ 
        zIndex: 9999, 
        padding: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div 
          className="db-modal-box profile-modal-container" 
          onClick={(e) => e.stopPropagation()} 
          style={{ 
            position: 'relative', 
            maxHeight: '90vh', 
            width: '100%',
            maxWidth: '650px',
            overflowY: 'auto', // Scroll enabled
            overflowX: 'hidden',
            padding: '10px',
            borderRadius: '24px',
            background: 'transparent' // Background taken from children UI
          }}
        >
          {showClose && (
            <button 
              onClick={onClose}
              style={{
                position: 'fixed', // Fixed so it stays while scrolling
                top: '40px',
                right: '40px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
                zIndex: 10000,
                color: '#334155',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <X size={24} />
            </button>
          )}
          <div style={{ padding: '10px' }}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="db-container">
      {/* HEADER */}
      <div className="db-header">
        <div className="db-header-left">
          <Target size={28} />
          <div className="user-welcome-area" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div 
                className="profile-circle" 
                onClick={() => setIsProfileOpen(true)}
                style={{
                  width: '45px', height: '45px', borderRadius: '50%',
                  overflow: 'hidden', cursor: 'pointer', border: '2px solid var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9'
                }}
             >
                {user?.profilePic || user?.avatar ? (
                  <img src={user.profilePic || user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={24} color="#64748b" />
                )}
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Hi, {user?.name?.split(' ')[0] || "User"} 👋</h2>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user?.role || 'Team Member'}</span>
             </div>

             <button 
                className="profile-settings-trigger" 
                onClick={() => setIsProfileOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
             >
                <Settings size={18} />
             </button>
          </div>
        </div>

        <div className="db-actions">
          <button className="db-btn" onClick={() => setIsChatOpen(true)}><MessageSquare size={16} /> Chat</button>
          <button className="db-btn" onClick={() => setIsAttendanceOpen(true)}><Calendar size={16} /> Attendance</button>
          <button className="db-btn" onClick={() => setIsHelpOpen(true)}><HelpCircle size={16} /> Help</button>
          <button className="db-btn logout" onClick={handleLogout}><LogOut size={16} /> Logout</button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="db-notifications">
        {notifications.map((note, i) => (
          <div key={i} className="db-toast"><Bell size={16} /> {note}</div>
        ))}
      </div>

      {/* STATS CARDS */}
      <div className="db-stats">
        <div className="db-card"><Clock /> <span>{pending.length}</span> Pending</div>
        <div className="db-card"><Loader2 /> <span>{progress.length}</span> In Progress</div>
        <div className="db-card"><CheckCircle /> <span>{done.length}</span> Completed</div>
      </div>

      {/* CHART SECTION */}
      <div className="db-chart">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" outerRadius={80} paddingAngle={5}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* TABS */}
      <div className="db-tabs">
        <button onClick={() => setTab("all")} className={tab === "all" ? "active" : ""}>All Tasks</button>
        <button onClick={() => setTab("active")} className={tab === "active" ? "active" : ""}>Active Missions</button>
      </div>

      {/* TASK GRID */}
      <div className="db-task-grid">
        {tasks
          .filter(t => tab === "all" || t.status !== "completed")
          .map(task => (
            <div key={task.id} className="db-task-card">
              <h3>{task.title}</h3>
              <p>{task.description || "No description provided"}</p>
              <div className="db-task-footer">
                <span className={`db-status ${task.status}`}>{task.status?.replace('_', ' ')}</span>
                <button className="db-update-btn" onClick={() => setSelectedTask(task)}>
                  Sync <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODALS SECTION */}
      
      {/* 🆕 PROFILE SETTINGS (With Scroll & Close Fix) */}
      <ModalPortal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}>
        <ProfileSettings 
          user={user} 
          onClose={() => setIsProfileOpen(false)} 
          onUpdate={handleProfileUpdate} 
        />
      </ModalPortal>

      <ModalPortal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}>
        <AllChat onClose={() => setIsChatOpen(false)} />
      </ModalPortal>

      <ModalPortal isOpen={isAttendanceOpen} onClose={() => setIsAttendanceOpen(false)}>
        <AttendanceForm onClose={() => setIsAttendanceOpen(false)} />
      </ModalPortal>

      <ModalPortal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)}>
        <HelpSupport user={user} onClose={() => setIsHelpOpen(false)} />
      </ModalPortal>

      <ModalPortal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
        <ProgressUpdateModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          refresh={() => fetchTasks(user)}
        />
      </ModalPortal>
    </div>
  );
}

export default Dashboard;