import React, { useEffect, useState, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Bell, LogOut, MessageSquare, Calendar, HelpCircle,
  Clock, CheckCircle, ChevronRight, Loader2, X, Target
} from "lucide-react";

import { getAllTasks } from "../services/api";

import AllChat from "./AllChat";
import AttendanceForm from "./AttendanceForm";
import ProgressUpdateModal from "./ProgressUpdateModal";
import HelpSupport from "./HelpSupport";

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

  // ===== FETCH TASKS =====
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

  // ===== INIT =====
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

  // ===== LOGOUT =====
  const handleLogout = () => {
    if (window.confirm("Have you want to logout?")) {
      if (onLogout) onLogout();
      else {
        localStorage.removeItem("dtms_user");
        setPage("login");
      }
    }
  };

  // ===== FILTER =====
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

  return (
    <div className="db-container">

      {/* HEADER */}
      <div className="db-header">
        <div className="db-header-left">
          <Target size={28} />
          <h2>Welcome {user?.name || "User"} 👋</h2>
        </div>

        <div className="db-actions">
          <button className="db-btn" onClick={() => setIsChatOpen(true)}>
            <MessageSquare size={16} /> Chat
          </button>

          <button className="db-btn" onClick={() => setIsAttendanceOpen(true)}>
            <Calendar size={16} /> Attendance
          </button>

          <button className="db-btn" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={16} /> Help
          </button>

          <button className="db-btn logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="db-notifications">
        {notifications.map((note, i) => (
          <div key={i} className="db-toast">
            <Bell size={16} /> {note}
          </div>
        ))}
      </div>

      {/* STATS */}
      <div className="db-stats">
        <div className="db-card"><Clock /> {pending.length} Pending</div>
        <div className="db-card"><Loader2 /> {progress.length} In Progress</div>
        <div className="db-card"><CheckCircle /> {done.length} Completed</div>
      </div>

      {/* CHART */}
      <div className="db-chart">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" outerRadius={80}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* FILTER */}
      <div className="db-tabs">
        <button onClick={() => setTab("all")} className={tab === "all" ? "active" : ""}>All</button>
        <button onClick={() => setTab("active")} className={tab === "active" ? "active" : ""}>Active</button>
      </div>

      {/* TASK LIST */}
      <div className="db-task-grid">
        {tasks
          .filter(t => tab === "all" || t.status !== "completed")
          .map(task => (
            <div key={task.id} className="db-task-card">
              <h3>{task.title}</h3>
              <p>{task.description || "No description"}</p>

              <div className="db-task-footer">
                <span className={`db-status ${task.status}`}>
                  {task.status}
                </span>

                <button onClick={() => setSelectedTask(task)}>
                  Update <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODALS WITH CLOSE BUTTON */}

      {isChatOpen && (
        <div className="db-modal-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="db-modal-box" onClick={(e) => e.stopPropagation()}>
            <X className="db-close-btn" onClick={() => setIsChatOpen(false)} />
            <AllChat />
          </div>
        </div>
      )}

      {isAttendanceOpen && (
        <div className="db-modal-overlay" onClick={() => setIsAttendanceOpen(false)}>
          <div className="db-modal-box" onClick={(e) => e.stopPropagation()}>
            <X className="db-close-btn" onClick={() => setIsAttendanceOpen(false)} />
            <AttendanceForm />
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="db-modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="db-modal-box" onClick={(e) => e.stopPropagation()}>
            <X className="db-close-btn" onClick={() => setIsHelpOpen(false)} />
            <HelpSupport user={user} />
          </div>
        </div>
      )}

      {selectedTask && (
        <ProgressUpdateModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

    </div>
  );
}

export default Dashboard;