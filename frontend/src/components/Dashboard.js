import { useEffect, useState, useCallback } from "react";
import "./Dashboard.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// ✅ CUSTOM COMPONENTS
import AllChat from "./AllChat";
import AttendanceForm from "./AttendanceForm";
import ProgressUpdateModal from "./ProgressUpdateModal";
import HelpSupport from "./HelpSupport"; // Machi, namma puthu component!

const API = "http://localhost:5000";

function Dashboard({ setPage }) {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pending");
  const [taskInputs, setTaskInputs] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [prevTaskCount, setPrevTaskCount] = useState(0);
  
  // Machi, Help section toggle panna intha state mukkiyam
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();

      if (data.length > prevTaskCount && user) {
        const newTasks = data.filter(
          (t) => t.assigned_to === user.email
        );

        if (newTasks.length > 0) {
          setNotifications(newTasks);
        }
      }

      setPrevTaskCount(data.length);
      setTasks(data);
    } catch (err) {
      console.error("Task fetch error:", err);
    }
  };

  const fetchNotifications = useCallback(async (currentUser) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();

      const myTasks = data.filter(
        (t) => t.assigned_to === currentUser.email
      );

      const unread = myTasks.filter(
        (t) => !readNotifications.includes(t.id)
      );

      setNotifications(unread);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  }, [readNotifications]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser) {
      fetchTasks();
      fetchNotifications(storedUser);
    }

    const interval = setInterval(() => {
      fetchTasks();
      if (storedUser) fetchNotifications(storedUser);
    }, 5000);

    return () => clearInterval(interval);

  }, [fetchNotifications]);

  const markComplete = async (task) => {
    const inputs = taskInputs[task.id] || {};

    if (!inputs.proof || !inputs.github) {
      alert("Please provide both Proof and GitHub links!");
      return;
    }

    try {
      const res = await fetch(`${API}/employee/complete-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          proof_link: inputs.proof,
          github_link: inputs.github
        })
      });

      const data = await res.json();
      alert(data.message);

      fetchTasks();
      fetchNotifications(user);

    } catch (err) {
      alert("Error completing task");
    }
  };

  const userTasks = tasks.filter(
    (t) => t.assigned_to === user?.email
  );

  const pendingTasks = userTasks.filter((t) => t.status === "pending");
  const inProgressTasks = userTasks.filter((t) => t.status === "in_progress");
  const completedTasks = userTasks.filter((t) => t.status === "completed");
  const blockedTasks = userTasks.filter((t) => t.status === "blocked");

  const chartData = [
    { name: "Pending", value: pendingTasks.length, color: "#ff4d4d" },
    { name: "In Progress", value: inProgressTasks.length, color: "#f1c40f" },
    { name: "Completed", value: completedTasks.length, color: "#2ecc71" },
    { name: "Blocked", value: blockedTasks.length, color: "#8e44ad" }
  ];

  return (
    <div className="dashboard-root">
      
      {/* HEADER SECTION */}
      <header className="dashboard-top-nav">
        <div className="header-user-profile">
          <h2 className="header-welcome-msg">Welcome, {user?.name} 👋</h2>
          <div className="header-meta-info">
            <span className="badge-pill role-badge">{user?.role}</span>
            <span className="badge-pill job-badge">{user?.job}</span>
          </div>
        </div>
        
        <div className="header-actions">
           {/* HELP TOGGLE BUTTON */}
           <button 
             className={`help-toggle-btn ${isHelpOpen ? 'active' : ''}`} 
             onClick={() => setIsHelpOpen(!isHelpOpen)}
           >
             {isHelpOpen ? "❌ Close Help" : "❓ Need Help?"}
           </button>

           <button className="dashboard-signout-btn" onClick={() => setPage("login")}>
             Sign Out
           </button>
        </div>
      </header>

      {/* NOTIFICATION TOAST */}
      {notifications.length > 0 && (
        <div className="alert-banner-toast">
          <span className="pulse-dot"></span>
          🔔 <strong>{notifications.length}</strong> New Tasks Assigned!
        </div>
      )}

      <main className="dashboard-grid-layout">
        
        {/* LEFT COLUMN: CHAT, ATTENDANCE & HELP */}
        <aside className="dashboard-sidebar-widgets">
          <AllChat />
          <AttendanceForm />
          
          {/* MACHI: Help Support-ah inga integrate panniruken, header button click panna open aagum */}
          {isHelpOpen && <HelpSupport user={user} />}
        </aside>

        {/* RIGHT COLUMN: CONTENT */}
        <div className="dashboard-main-content">
          
          {/* RUNNING STATS BAR */}
          <div className="stats-ticker-bar">
            <div className="ticker-item"><span className="dot pending-dot"></span> {pendingTasks.length} Pending</div>
            <div className="ticker-item"><span className="dot progress-dot"></span> {inProgressTasks.length} In Progress</div>
            <div className="ticker-item"><span className="dot complete-dot"></span> {completedTasks.length} Completed</div>
            <div className="ticker-item"><span className="dot blocked-dot) "></span> {blockedTasks.length} Blocked</div>
          </div>

          {/* ANALYTICS CARDS */}
          <section className="analytics-dashboard-section">
            <div className="metric-cards-grid">
              <div className="metric-card card-total">
                <p className="metric-label">Total Assigned</p>
                <h3 className="metric-value">{userTasks.length}</h3>
              </div>
              <div className="metric-card card-pending">
                <p className="metric-label">Remaining</p>
                <h3 className="metric-value">{pendingTasks.length}</h3>
              </div>
              <div className="metric-card card-completed">
                <p className="metric-label">Finished</p>
                <h3 className="metric-value">{completedTasks.length}</h3>
              </div>
            </div>

            <div className="performance-chart-container">
              <h3 className="section-sub-title">Performance Overview</h3>
              <div className="chart-wrapper-inner">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* TASK MANAGEMENT */}
          <section className="task-board-section">
            <div className="task-tabs-navigation">
              <button className={`nav-tab-btn ${tab === "pending" ? "is-active" : ""}`} onClick={() => setTab("pending")}>
                Pending ({pendingTasks.length})
              </button>
              <button className={`nav-tab-btn ${tab === "in_progress" ? "is-active" : ""}`} onClick={() => setTab("in_progress")}>
                In Progress ({inProgressTasks.length})
              </button>
              <button className={`nav-tab-btn ${tab === "completed" ? "is-active" : ""}`} onClick={() => setTab("completed")}>
                Completed ({completedTasks.length})
              </button>
            </div>

            <div className="task-cards-display-grid">
              {(tab === "pending" ? pendingTasks : tab === "in_progress" ? inProgressTasks : completedTasks).map((task) => {
                const isOverdue = new Date() > new Date(task.dueDate) && task.status !== "completed";

                return (
                  <div key={task.id} className={`task-item-card status-${task.status}`}>
                    <div className="task-card-header">
                      <h4 className="task-card-title">{task.title}</h4>
                      <span className={`status-pill pill-${task.status}`}>{task.status}</span>
                    </div>
                    
                    <p className="task-card-desc">{task.description}</p>

                    <div className="task-card-meta">
                      <p className={`deadline-text ${isOverdue ? "text-danger" : "text-success"}`}>
                        📅 Deadline: {task.dueDate}
                      </p>
                      <div className="progress-container-main">
                        <div className="progress-label-row">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="progress-track-bg">
                          <div className="progress-fill-bar" style={{ width: `${task.progress}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="task-card-actions">
                      {task.status !== "completed" && (
                        <button className="btn-update-progress" onClick={() => setSelectedTask(task)}>
                          Update Progress
                        </button>
                      )}

                      {task.status === "pending" && (
                        <div className="submission-fields-group">
                          <input
                            className="task-form-input"
                            placeholder="🔗 Proof Link"
                            onChange={(e) => setTaskInputs({
                              ...taskInputs,
                              [task.id]: { ...taskInputs[task.id], proof: e.target.value }
                            })}
                          />
                          <input
                            className="task-form-input"
                            placeholder="🐙 GitHub Link"
                            onChange={(e) => setTaskInputs({
                              ...taskInputs,
                              [task.id]: { ...taskInputs[task.id], github: e.target.value }
                            })}
                          />
                          <button className="btn-submit-task" onClick={() => markComplete(task)}>
                            Submit Work
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* MODAL OVERLAY */}
      {selectedTask && (
        <ProgressUpdateModal
          task={selectedTask}
          close={() => setSelectedTask(null)}
          refresh={fetchTasks}
        />
      )}

    </div>
  );
}

export default Dashboard;