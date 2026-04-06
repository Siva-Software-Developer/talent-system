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
  Loader2,
  X
} from "lucide-react";

import { getAllTasks, completeTask } from "../services/api";

import AllChat from "./AllChat";
import AttendanceForm from "./AttendanceForm";
import ProgressUpdateModal from "./ProgressUpdateModal";
import HelpSupport from "./HelpSupport";

import "./Dashboard.css";

function Dashboard({ setPage }) {

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
      const data = res.data || [];

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

  // ================= INIT =================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("dtms_user")); // ✅ FIX

    if (storedUser && storedUser.email) {
      setUser(storedUser);
      fetchTasks(storedUser);
    } else {
      setPage("login");
    }

    const interval = setInterval(() => {
      const currentUser = JSON.parse(localStorage.getItem("dtms_user"));
      if (currentUser) fetchTasks(currentUser);
    }, 10000);

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

  const handleLogout = () => {
    localStorage.removeItem("dtms_user"); // ✅ FIX
    setPage("login");
  };

  // ================= DATA =================
  const pending = tasks.filter(t => t.status === "pending");
  const progress = tasks.filter(t => t.status === "in_progress");
  const done = tasks.filter(t => t.status === "completed");

  const chartData = [
    { name: "Pending", value: pending.length, color: "#f43f5e" },
    { name: "Progress", value: progress.length, color: "#f59e0b" },
    { name: "Done", value: done.length, color: "#10b981" }
  ];

  if (loading) {
    return (
      <div className="db-loader-screen">
        <Loader2 className="db-spinner" size={48} />
        <p className="db-loader-text">Launching Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="db-container">

      {/* HEADER */}
      <header className="db-header">
        <div className="db-header-left">
          <div className="db-logo-box">
            <LayoutDashboard size={22} />
          </div>
          <h2 className="db-welcome">
            Hello, <span className="db-user-name">{user?.name}</span> 👋
          </h2>
        </div>

        <div className="db-header-right">
          <button className="db-nav-pill" onClick={() => setIsChatOpen(true)}>
            <MessageSquare size={18} /> <span>Announcements</span>
          </button>

          <button className="db-nav-pill" onClick={() => setIsAttendanceOpen(true)}>
            <Calendar size={18} /> <span>Attendance</span>
          </button>

          <div className="db-divider"></div>

          <button className="db-icon-circle" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} />
          </button>

          <button className="db-icon-circle db-logout" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* NOTIFICATION */}
      {notifications.length > 0 && (
        <div className="db-toast slide-in-right">
          <Bell size={18} />
          <span>{notifications[0]}</span>
        </div>
      )}

      {/* CONTENT */}
      <main className="db-content">

        {/* STAT CARDS */}
        <div className="db-stat-grid">
          <div className="db-stat-card db-stat-pending">
            <Clock size={20} />
            <div>
              <h3>{pending.length}</h3>
              <p>Pending Tasks</p>
            </div>
          </div>

          <div className="db-stat-card db-stat-progress">
            <Loader2 size={20} />
            <div>
              <h3>{progress.length}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="db-stat-card db-stat-done">
            <CheckCircle size={20} />
            <div>
              <h3>{done.length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="db-chart-box">
          <h3>Visual Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius={65} outerRadius={85}>
                {chartData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TASK LIST */}
        <div className="db-task-box">
          <h3>My Tasks</h3>

          {tasks.length > 0 ? (
            tasks.map(task => (
              <div key={task.id} className="db-task-card">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
              </div>
            ))
          ) : (
            <p>No tasks found machi 😄</p>
          )}
        </div>

      </main>

      {/* MODALS */}
      {isChatOpen && <AllChat />}
      {isAttendanceOpen && <AttendanceForm />}
      {isHelpOpen && <HelpSupport user={user} />}
      {selectedTask && <ProgressUpdateModal task={selectedTask} />}

    </div>
  );
}

export default Dashboard;