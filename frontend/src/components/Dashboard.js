import React, { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { 
  Bell, 
  LogOut, 
  MessageSquare, 
  Calendar, 
  CircleHelp as HelpCircle, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Loader2,
  X,
  Target
} from "lucide-react";

import { getAllTasks } from "../services/api";

import AllChat from "./AllChat";
import AttendanceForm from "./AttendanceForm";
import ProgressUpdateModal from "./ProgressUpdateModal";
import HelpSupport from "./HelpSupport";

import "./Dashboard.css";

function Dashboard({ setPage }) {

  // ================= STATES =================
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("all"); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [prevTaskCount, setPrevTaskCount] = useState(0);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  // ================= FETCH LOGIC =================
  const fetchTasks = useCallback(async (currentUser) => {
    if (!currentUser) return;

    try {
      const res = await getAllTasks();
      const data = res.data || [];

      // Filter only tasks assigned to this user
      const myTasks = data.filter((t) => t.assigned_to === currentUser.email);

      // Notification Logic for New Tasks
      if (myTasks.length > prevTaskCount && prevTaskCount !== 0) {
        const newTasksCount = myTasks.length - prevTaskCount;
        setNotifications(prev => [`${newTasksCount} New Task Assigned! 🚀`, ...prev]);
        setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
      }

      setPrevTaskCount(myTasks.length);
      setTasks(myTasks);
      setLoading(false);

    } catch (err) {
      console.error("Machi, Task fetch error:", err);
      setLoading(false);
    }
  }, [prevTaskCount]);

  // ================= INITIALIZATION =================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("dtms_user"));

    if (storedUser && storedUser.email) {
      setUser(storedUser);
      fetchTasks(storedUser);
    } else {
      setPage("login");
    }

    const interval = setInterval(() => {
      const currentUser = JSON.parse(localStorage.getItem("dtms_user"));
      if (currentUser) fetchTasks(currentUser);
    }, 15000);

    return () => clearInterval(interval);

  }, [fetchTasks, setPage]);

  // ================= HANDLERS =================
  const handleLogout = () => {
    if(window.confirm("Kandippa logout pannanuma machi?")) {
      localStorage.removeItem("dtms_user");
      setPage("login");
    }
  };

  const openTaskUpdate = (task) => {
    setSelectedTask(task);
  };

  // ================= DATA FILTERING =================
  const pending = tasks.filter(t => t.status === "pending" || t.status === "todo");
  const progress = tasks.filter(t => t.status === "in_progress");
  const done = tasks.filter(t => t.status === "completed");

  const chartData = [
    { name: "Pending", value: pending.length, color: "#6366f1" },
    { name: "In Progress", value: progress.length, color: "#f59e0b" },
    { name: "Done", value: done.length, color: "#10b981" }
  ];

  if (loading) {
    return (
      <div className="db-loader-screen">
        <div className="db-loader-content">
          <Loader2 className="db-spinner" size={50} />
          <p className="db-loader-text">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-container">

      {/* --- PREMIUM HEADER --- */}
      <header className="db-header">
        <div className="db-header-left">
          <div className="db-logo-box">
            <Target size={24} color="white" />
          </div>
          <div className="db-user-info">
            <h2 className="db-welcome">Welcome, {user?.name?.split(' ')[0]}</h2>
            <p className="db-date-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="db-header-right">
          <button className="db-nav-pill primary" onClick={() => setIsChatOpen(true)}>
            <MessageSquare size={18} /> <span>Announcements</span>
          </button>

          <button className="db-nav-pill secondary" onClick={() => setIsAttendanceOpen(true)}>
            <Calendar size={18} /> <span>Attendance</span>
          </button>

          <div className="db-divider"></div>

          <button className="db-icon-btn help" title="Support" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={20} />
          </button>

          <button className="db-icon-btn logout" title="Sign Out" onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* --- NOTIFICATION TOAST --- */}
      {notifications.length > 0 && (
        <div className="db-toast-container">
          {notifications.map((note, idx) => (
            <div key={idx} className="db-toast animate-slide-in">
              <Bell size={18} className="db-bell-pulse" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="db-content">
        
        {/* TOP ROW: Stats & Analytics */}
        <div className="db-top-layout">
          
          {/* STAT CARDS */}
          <div className="db-stat-stack">
            <div className="db-stat-card pending">
              <div className="db-stat-icon"><Clock size={22} /></div>
              <div className="db-stat-data">
                <h3>{pending.length}</h3>
                <p>Pending Tasks</p>
              </div>
            </div>

            <div className="db-stat-card progress">
              <div className="db-stat-icon"><Loader2 size={22} /></div>
              <div className="db-stat-data">
                <h3>{progress.length}</h3>
                <p>In Progress</p>
              </div>
            </div>

            <div className="db-stat-card completed">
              <div className="db-stat-icon"><CheckCircle size={22} /></div>
              <div className="db-stat-data">
                <h3>{done.length}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>

          {/* ANALYTICS CHART */}
          <div className="db-chart-card">
            <div className="db-card-header">
              <h3>Productivity Overview</h3>
              <p>Task status distribution</p>
            </div>
            <div className="db-chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie 
                    data={chartData} 
                    dataKey="value" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={8}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="db-chart-legend">
                {chartData.map((item, idx) => (
                  <div key={idx} className="db-legend-item">
                    <span className="db-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="db-label">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: TASK LIST */}
        <div className="db-task-section">
          <div className="db-section-header">
            <h3>My Assignments</h3>
            <div className="db-filter-tabs">
              <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All</button>
              <button className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>To-Do</button>
            </div>
          </div>

          <div className="db-task-grid">
            {tasks.length > 0 ? (
              tasks
                .filter(t => tab === 'all' || t.status !== 'completed')
                .map(task => (
                <div key={task.id} className={`db-task-item status-${task.status}`}>
                  <div className="db-task-body">
                    <div className="db-task-meta">
                       <span className="db-task-id">#{task.id.toString().slice(-4)}</span>
                       <span className={`db-status-pill ${task.status}`}>{task.status}</span>
                    </div>
                    <h4>{task.title}</h4>
                    <p>{task.description || "No description provided."}</p>
                    
                    <div className="db-task-footer">
                      <div className="db-due-info">
                         <Calendar size={14} />
                         <span>Due: {task.dueDate || 'No Date'}</span>
                      </div>
                      <button className="db-update-btn" onClick={() => openTaskUpdate(task)}>
                        Update <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="db-empty-state">
                <div className="db-empty-icon">🏖️</div>
                <h4>All Caught Up!</h4>
                <p>No active tasks assigned to you right now.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL OVERLAYS (INTEGRATED WITH FIXED LOGIC) --- */}
      
      {isChatOpen && (
        <div className="db-overlay" style={{ zIndex: 9999 }} onClick={() => setIsChatOpen(false)}>
          <div className="db-modal-content chat" onClick={e => e.stopPropagation()}>
            <div className="db-modal-close" style={{cursor: 'pointer'}} onClick={() => setIsChatOpen(false)}>
              <X size={30} color="black" />
            </div>
            <AllChat />
          </div>
        </div>
      )}

      {isAttendanceOpen && (
        <div className="db-overlay" style={{ zIndex: 9999 }} onClick={() => setIsAttendanceOpen(false)}>
          <div className="db-modal-content attendance" onClick={e => e.stopPropagation()}>
            <button className="db-modal-close-top" style={{cursor: 'pointer'}} onClick={() => setIsAttendanceOpen(false)}>
              <X size={30} />
            </button>
            <AttendanceForm />
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="db-overlay" style={{ zIndex: 9999 }} onClick={() => setIsHelpOpen(false)}>
          <div className="db-modal-content help" onClick={e => e.stopPropagation()}>
             <div className="db-modal-close" style={{cursor: 'pointer'}} onClick={() => setIsHelpOpen(false)}>
              <X size={30} />
            </div>
            <HelpSupport user={user} onClose={() => setIsHelpOpen(false)} />
          </div>
        </div>
      )}

      {selectedTask && (
        <ProgressUpdateModal 
          task={selectedTask} 
          onClose={() => {
            setSelectedTask(null);
            fetchTasks(user);
          }} 
        />
      )}

    </div>
  );
}

export default Dashboard;