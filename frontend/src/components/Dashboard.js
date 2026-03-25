import { useEffect, useState } from "react";
import "./Dashboard.css";

const API = "http://localhost:5000";

function Dashboard({ setPage }) {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assigned_to: "",
    github: "",
    file: null
  });

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pending");

  // 🔄 FETCH TASKS
  const fetchTasks = async () => {
    let res = await fetch(`${API}/tasks`);
    let data = await res.json();
    setTasks(data);
  };

  // 🔔 FETCH NOTIFICATIONS
  const fetchNotifications = async (currentUser) => {
    if (!currentUser) return;

    let res = await fetch(`${API}/tasks`);
    let data = await res.json();

    const myTasks = data.filter(
      t => t.assigned_to === currentUser.email
    );

    const unread = myTasks.filter(
      t => !readNotifications.includes(t.id)
    );

    setNotifications(unread);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser) {
      fetchTasks();
      fetchNotifications(storedUser);
    }
  }, [readNotifications]);

  // ➕ ADD TASK
  const addTask = async () => {
    if (!form.title) return alert("Title required");

    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        assigned_by: user?.email || "self",
        assigned_to: form.assigned_to || user?.email
      })
    });

    setForm({ title: "", description: "", dueDate: "", assigned_to: "", github: "", file: null });
    fetchTasks();
    fetchNotifications(user);
  };

  // ❌ DELETE
  const deleteTask = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
    fetchNotifications(user);
  };

  // ✅ COMPLETE
  const markComplete = async (task) => {
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: "completed" })
    });

    fetchTasks();
    fetchNotifications(user);
  };

  // 🔔 MARK AS READ
  const markAsRead = (id) => {
    setReadNotifications([...readNotifications, id]);
  };

  const clearAllNotifications = () => {
    setReadNotifications(notifications.map(n => n.id));
    setNotifications([]);
  };

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="dashboard-container">

      {/* 🔹 SIDEBAR */}
      <div className="user-card">
        <div>
          <h2>Welcome, {user?.name}</h2>
          <p>{user?.role} | {user?.job}</p>
        </div>

        <button onClick={() => setPage("login")}>
          Logout
        </button>
      </div>

      {/* 🔹 MAIN */}
      <div className="main-content-area">

        {/* 🔔 RUNNING NOTIFICATION */}
        <div className="running-bar">
          <div className="scroll-text">
            🔔 You have {notifications.length} new notifications | Stay productive 🚀
          </div>
        </div>

        {/* 📊 STATS */}
        <div className="stats-grid">

          <div className="stat-card">
            <h4>Total Tasks</h4>
            <p>{tasks.length}</p>
          </div>

          <div className="stat-card">
            <h4>Pending</h4>
            <p>{pendingTasks.length}</p>
          </div>

          <div className="stat-card">
            <h4>Completed</h4>
            <p>{completedTasks.length}</p>
          </div>

        </div>

        {/* 🔔 NOTIFICATIONS */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>🔔 Notifications</h3>
          {notifications.length > 0 && (
            <button onClick={clearAllNotifications} style={{ width: "auto" }}>
              Clear All
            </button>
          )}
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="notification-card">
                <p><b>{n.assigned_by}</b> assigned you a task</p>
                <p>{n.title}</p>

                <button
                  style={{ marginTop: "10px", width: "auto" }}
                  onClick={() => markAsRead(n.id)}
                >
                  Mark as Read
                </button>
              </div>
            ))
          )}
        </div>

        {/* ➕ ADD TASK */}
        <h3>Create Task</h3>

        <div className="input-group">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          {/* 🔗 GitHub Link */}
          <input
            placeholder="GitHub Repo Link (optional)"
            value={form.github}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
          />

          {/* 📎 File Upload */}
          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
          />

          {user?.role === "admin" && (
            <input
              placeholder="Assign email"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
            />
          )}

          <button onClick={addTask}>Add</button>
        </div>

        {/* 📂 TABS */}
        <div className="tab-buttons">
          <button
            className={tab === "pending" ? "active" : ""}
            onClick={() => setTab("pending")}
          >
            Pending
          </button>

          <button
            className={tab === "completed" ? "active" : ""}
            onClick={() => setTab("completed")}
          >
            Completed
          </button>
        </div>

        {/* 📋 TASK LIST */}
        <div className="task-list">
          {(tab === "pending" ? pendingTasks : completedTasks).map(task => (
            <div key={task.id} className="task-card">

              <h4>{task.title}</h4>
              <p>{task.description}</p>

              <p>📅 {task.dueDate}</p>
              <p>👤 {task.assigned_by}</p>

              {task.github && <p>🔗 {task.github}</p>}
              {task.file && <p>📎 File attached</p>}

              {task.status === "pending" && (
                <div className="task-actions">
                  <button onClick={() => markComplete(task)}>
                    Complete
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{ background: "red" }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;