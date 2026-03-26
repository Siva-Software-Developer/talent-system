import { useEffect, useState, useCallback } from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const API = "http://localhost:5000";

function Dashboard({ setPage }) {
  // 1. STATES
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pending");
  const [taskInputs, setTaskInputs] = useState({});

  // 2. FETCH TASKS LOGIC
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Task fetch error:", err);
    }
  };

  // 3. FETCH NOTIFICATIONS (FIXED WITH useCallback TO AVOID WARNING)
  const fetchNotifications = useCallback(async (currentUser) => {
    if (!currentUser) {
      return;
    }

    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();

      // Only show tasks assigned to this specific user
      const myTasks = data.filter(
        (t) => t.assigned_to === currentUser.email
      );

      // Filter out notifications that user already clicked 'Read'
      const unread = myTasks.filter(
        (t) => !readNotifications.includes(t.id)
      );

      setNotifications(unread);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  }, [readNotifications]); 

  // 4. LOAD INITIAL DATA
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser) {
      fetchTasks();
      fetchNotifications(storedUser);
    }
  }, [fetchNotifications]); // Ippo warning varadhu machi!

  // 5. TASK OPERATIONS (DELETE & COMPLETE)
  const deleteTask = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
      fetchTasks();
      fetchNotifications(user);
    } catch (err) {
      alert("Delete failed");
    }
  };

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

  // 6. NOTIFICATION CONTROLS
  const markAsRead = (id) => {
    setReadNotifications((prev) => [...prev, id]);
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifications((prev) => [...prev, ...allIds]);
    setNotifications([]);
  };

  // 7. FILTERED LISTS FOR RENDER
  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" && t.assigned_to === user?.email
  );

  const completedTasks = tasks.filter(
    (t) => t.status === "completed" && t.assigned_to === user?.email
  );

  // Chart Data
  const chartData = [
    { name: "Pending", value: pendingTasks.length, color: "#ff4d4d" },
    { name: "Completed", value: completedTasks.length, color: "#2ecc71" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f7f6" }}>
      
      {/* LEFT SIDEBAR */}
      <Sidebar setTab={setTab} tab={tab} />

      <div className="dashboard-container" style={{ flex: 1, padding: "20px" }}>
        
        {/* USER PROFILE CARD */}
        <div className="user-card premium-glass">
          <div className="user-info">
            <h2>Welcome back, {user?.name} 👋</h2>
            <p className="user-meta">{user?.role} • {user?.job}</p>
          </div>
          <button className="logout-btn" onClick={() => setPage("login")}>
            Logout
          </button>
        </div>

        {/* NOTIFICATION POPUP */}
        {notifications.length > 0 && (
          <div className="notification-popup-alert">
            <span className="pulse-icon">🔔</span> 
            {notifications.length} New Tasks need your attention!
          </div>
        )}

        <div className="main-content-area">
          
          {/* MARQUEE RUNNING BAR */}
          <div className="running-bar">
            <div className="scroll-text">
              🚀 Status Update: {pendingTasks.length} tasks pending review. Keep it up! 🔔 {notifications.length} Unread Notifications.
            </div>
          </div>

          {/* ANALYTICS & STATS SECTION */}
          <div className="analytics-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Assigned Tasks</h4>
                <p className="stat-num">{pendingTasks.length + completedTasks.length}</p>
              </div>
              <div className="stat-card">
                <h4 style={{ color: "#ff4d4d" }}>Pending</h4>
                <p className="stat-num">{pendingTasks.length}</p>
              </div>
              <div className="stat-card">
                <h4 style={{ color: "#2ecc71" }}>Completed</h4>
                <p className="stat-num">{completedTasks.length}</p>
              </div>
            </div>

            <div className="chart-box premium-glass">
              <h3>📊 Performance Overview</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* NOTIFICATION CENTER */}
          <div className="notification-center">
            <div className="section-header">
              <h3>Recent Notifications</h3>
              {notifications.length > 0 && (
                <button className="clear-btn" onClick={clearAllNotifications}>
                  Mark All as Read
                </button>
              )}
            </div>
            
            <div className="notification-list">
              {notifications.length === 0 ? (
                <p className="no-data">No new notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    <span>📌 New Task Assigned: <strong>{n.title}</strong></span>
                    <button onClick={() => markAsRead(n.id)}>✕</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TASK MANAGEMENT TABS */}
          <div className="task-management-section">
            <div className="tab-buttons">
              <button 
                className={tab === "pending" ? "active-tab" : ""} 
                onClick={() => setTab("pending")}
              >
                Pending List ({pendingTasks.length})
              </button>
              <button 
                className={tab === "completed" ? "active-tab" : ""} 
                onClick={() => setTab("completed")}
              >
                Completed History ({completedTasks.length})
              </button>
            </div>

            <div className="tasks-display-area">
              {(tab === "pending" ? pendingTasks : completedTasks).map((task) => (
                <div key={task.id} className={`task-card-item ${task.status}`}>
                  <div className="task-content">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    
                    {task.status === "pending" ? (
                      <div className="submission-form">
                        <input
                          type="text"
                          placeholder="Link to Proof (Drive/Image)"
                          value={taskInputs[task.id]?.proof || ""}
                          onChange={(e) =>
                            setTaskInputs({
                              ...taskInputs,
                              [task.id]: { ...taskInputs[task.id], proof: e.target.value }
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="GitHub Repository Link"
                          value={taskInputs[task.id]?.github || ""}
                          onChange={(e) =>
                            setTaskInputs({
                              ...taskInputs,
                              [task.id]: { ...taskInputs[task.id], github: e.target.value }
                            })
                          }
                        />
                        <button className="complete-btn" onClick={() => markComplete(task)}>
                          SUBMIT WORK
                        </button>
                      </div>
                    ) : (
                      <div className="completed-info">
                        <p>🎯 <strong>Status:</strong> Completed</p>
                        <p>🔗 <a href={task.proof_link} target="_blank" rel="noreferrer">View Proof</a></p>
                        <p>💻 <a href={task.github_link} target="_blank" rel="noreferrer">GitHub Link</a></p>
                      </div>
                    )}
                  </div>
                  <button className="del-task-btn" onClick={() => deleteTask(task.id)}>
                    🗑️
                  </button>
                </div>
              ))}
              
              {(tab === "pending" ? pendingTasks : completedTasks).length === 0 && (
                <div className="empty-state">No tasks found in this category.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;