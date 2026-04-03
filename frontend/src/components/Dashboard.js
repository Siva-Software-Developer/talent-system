import React, { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import { 
  Bell, 
  LogOut, 
  MessageSquare, 
  Calendar, 
  CircleHelp as HelpCircle, 
  Clock, 
  CheckCircle, 
  GitBranch,
  ExternalLink,
  ChevronRight, 
  LayoutDashboard, 
  Loader2 
} from "lucide-react";

import { getAllTasks, completeTask } from "../services/api";

import AllChat from "./AllChat";
import AttendanceForm from "./AttendanceForm";
import ProgressUpdateModal from "./ProgressUpdateModal";
import HelpSupport from "./HelpSupport";

import "./Dashboard.css";

function Dashboard({ setPage }) {

  // ================= STATE =================
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pending");
  const [taskInputs, setTaskInputs] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [prevTaskCount, setPrevTaskCount] = useState(0);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  // ================= FETCH =================
  const fetchTasks = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const res = await getAllTasks();
      const data = res.data;

      const myTasks = data.filter((t) => t.assigned_to === currentUser.email);

      if (myTasks.length > prevTaskCount && prevTaskCount !== 0) {
        const newTasks = myTasks.length - prevTaskCount;
        setNotifications(prev => [...prev, `${newTasks} New Task Assigned! 🚀`]);
        setTimeout(() => setNotifications([]), 4000);
      }

      setPrevTaskCount(myTasks.length);
      setTasks(myTasks);
      setLoading(false);

    } catch (err) {
      console.error("Task fetch error:", err);
      setLoading(false);
    }
  }, [prevTaskCount]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchTasks(storedUser);
    } else {
      setPage("login");
    }

    const interval = setInterval(() => fetchTasks(storedUser), 10000);
    return () => clearInterval(interval);

  }, [fetchTasks, setPage]);

  // ================= HANDLERS =================
  const handleInputChange = (taskId, field, value) => {
    setTaskInputs(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: value }
    }));
  };

  const handleMarkComplete = async (task) => {
    const inputs = taskInputs[task.id] || {};

    if (!inputs.proof || !inputs.github) {
      alert("Proof + GitHub link required 🛑");
      return;
    }

    try {
      await completeTask({
        id: task.id,
        proof_link: inputs.proof,
        github_link: inputs.github
      });

      alert("Task submitted 🚀");
      fetchTasks(user);

    } catch {
      alert("Submission error ❌");
    }
  };

  // ================= FILTER =================
  const pending = tasks.filter(t => t.status === "pending");
  const progress = tasks.filter(t => t.status === "in_progress");
  const done = tasks.filter(t => t.status === "completed");

  const chartData = [
    { name: "Pending", value: pending.length, color: "#ef4444" },
    { name: "Progress", value: progress.length, color: "#f59e0b" },
    { name: "Done", value: done.length, color: "#10b981" }
  ];

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="loading-screen-full">
        <Loader2 className="loading-spinner animate-spin" size={50} />
        <p className="loading-text">Initializing Mission Control...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-root">

      {/* ===== HEADER ===== */}
      <header className="dashboard-header glass-effect">
        <div className="header-brand">
          <div className="brand-logo">
            <LayoutDashboard size={24} className="icon-primary" />
          </div>
          <h2 className="header-title">Welcome, <span className="user-highlight">{user?.name}</span></h2>
        </div>

        <div className="header-nav">
          <button className="nav-btn" onClick={() => setIsChatOpen(true)}>
            <MessageSquare size={18} /> <span>Chat</span>
          </button>

          <button className="nav-btn" onClick={() => setIsAttendanceOpen(true)}>
            <Calendar size={18} /> <span>Attendance</span>
          </button>

          <button className="nav-icon-btn help-trigger" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} />
          </button>

          <button className="nav-icon-btn logout-trigger" title="Logout" onClick={() => { localStorage.clear(); setPage("login"); }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ===== NOTIFICATION ===== */}
      {notifications.length > 0 && (
        <div className="notification-toast slide-in">
          <Bell size={18} className="bell-animate" /> 
          <span className="notification-msg">{notifications[0]}</span>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="dashboard-main">

        {/* QUICK STATS SECTION */}
        <section className="stats-container">
          <div className="stat-card stat-pending">
            <div className="stat-icon-wrapper"><Clock size={20} /></div>
            <div className="stat-content">
               <span className="stat-value">{pending.length}</span>
               <span className="stat-label">Pending</span>
            </div>
          </div>
          
          <div className="stat-card stat-progress">
            <div className="stat-icon-wrapper"><Loader2 size={20} /></div>
            <div className="stat-content">
               <span className="stat-value">{progress.length}</span>
               <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card stat-done">
            <div className="stat-icon-wrapper"><CheckCircle size={20} /></div>
            <div className="stat-content">
               <span className="stat-value">{done.length}</span>
               <span className="stat-label">Completed</span>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
            {/* ANALYTICS CARD */}
            <section className="chart-section glass-effect">
                <h3 className="section-subtitle">Performance Overview</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie data={chartData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={8}>
                        {chartData.map((e, i) => (
                            <Cell key={i} fill={e.color} stroke="none" />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '10px', background: '#1e293b', border: 'none', color: '#fff' }} />
                        <Legend iconType="circle" />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* TASK MANAGEMENT SECTION */}
            <section className="tasks-section glass-effect">
                <div className="tasks-header">
                    <h3 className="section-subtitle">Task Management</h3>
                    <div className="task-tabs">
                        {["pending", "in_progress", "completed"].map(t => (
                            <button 
                                key={t} 
                                className={`tab-btn ${tab === t ? "tab-active" : ""}`}
                                onClick={() => setTab(t)}
                            >
                                {t.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="tasks-scroll-area">
                    {(tab === "pending" ? pending : tab === "in_progress" ? progress : done).length > 0 ? (
                        (tab === "pending" ? pending : tab === "in_progress" ? progress : done).map(task => (
                            <div key={task.id} className={`task-card task-border-${task.status}`}>
                                <div className="task-info">
                                    <h4 className="task-title">{task.title}</h4>
                                    <p className="task-desc">{task.description || "No description provided."}</p>
                                </div>

                                {/* Conditional Render for Submission (Pending Only) */}
                                {tab === "pending" && (
                                    <div className="task-submission-form">
                                        <div className="input-field">
                                            <ExternalLink size={14} className="input-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Deployment/Proof URL"
                                                className="dashboard-input"
                                                onChange={(e) => handleInputChange(task.id, "proof", e.target.value)}
                                            />
                                        </div>

                                        <div className="input-field">
                                            <GitBranch size={14} className="input-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="GitHub Repository Link"
                                                className="dashboard-input"
                                                onChange={(e) => handleInputChange(task.id, "github", e.target.value)}
                                            />
                                        </div>

                                        <button className="btn-submit-task" onClick={() => handleMarkComplete(task)}>
                                            Submit Work
                                        </button>
                                    </div>
                                )}

                                {/* Conditional Render for Progress Update */}
                                {tab === "in_progress" && (
                                    <button className="btn-update-task" onClick={() => setSelectedTask(task)}>
                                        Update Progress <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-tasks">
                            <p>No tasks in this category. 🏖️</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
      </main>

      {/* ===== MODAL OVERLAYS ===== */}
      {isChatOpen && (
        <div className="modal-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="modal-container chat-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Team Announcements</h3>
                <button className="close-modal" onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <AllChat />
          </div>
        </div>
      )}

      {isAttendanceOpen && (
        <div className="modal-overlay" onClick={() => setIsAttendanceOpen(false)}>
          <div className="modal-container attendance-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Log Attendance</h3>
                <button className="close-modal" onClick={() => setIsAttendanceOpen(false)}>×</button>
            </div>
            <AttendanceForm />
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="modal-container help-modal" onClick={e => e.stopPropagation()}>
             <div className="modal-header">
                <h3>Support & Help</h3>
                <button className="close-modal" onClick={() => setIsHelpOpen(false)}>×</button>
            </div>
            <HelpSupport user={user} />
          </div>
        </div>
      )}

      {selectedTask && (
        <ProgressUpdateModal
          task={selectedTask}
          close={() => setSelectedTask(null)}
          refresh={() => fetchTasks(user)}
        />
      )}

    </div>
  );
}

export default Dashboard;