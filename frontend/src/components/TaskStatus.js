import React, { useEffect, useState } from "react";
import "./TaskStatus.css";

const API = "http://localhost:5000";

function TaskStatus() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Submission & Blocker States
  const [submitting, setSubmitting] = useState(null); 
  const [blockerReporting, setBlockerReporting] = useState(null);
  const [proofLink, setProofLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [blockerText, setBlockerText] = useState("");

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // 1. FETCH TASKS
  const fetchMyTasks = async () => {
    try {
      const response = await fetch(`${API}/tasks`);
      const allTasks = await response.json();
      const myTasks = allTasks.filter((t) => t.assigned_to === user?.email);
      setTasks(myTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchMyTasks();
  }, [user?.email]);

  // 2. SUBMIT COMPLETION
  const handleSubmitTask = async (taskId) => {
    if (!proofLink || !githubLink) {
      alert("Machi, Proof link and GitHub link renduமே mukkiyam!");
      return;
    }

    try {
      const response = await fetch(`${API}/employee/complete-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          proof_link: proofLink,
          github_link: githubLink,
        }),
      });

      const result = await response.json();
      alert(result.message);
      setSubmitting(null);
      setProofLink("");
      setGithubLink("");
      fetchMyTasks();
    } catch (err) {
      alert("Submission failed machi!");
    }
  };

  // 3. REPORT BLOCKER (The New Feature!)
  const handleReportBlocker = async (taskId) => {
    if (!blockerText) {
      alert("Machi, enna issue-nu sonna thaana admin-ku puriyum!");
      return;
    }

    try {
      const response = await fetch(`${API}/employee/report-blocker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          blocker: blockerText,
        }),
      });

      const result = await response.json();
      alert("Admin-ku inform panniyaachu machi! 😎");
      setBlockerReporting(null);
      setBlockerText("");
      fetchMyTasks();
    } catch (err) {
      alert("Blocker report panna mudiyala!");
    }
  };

  if (loading) return <div className="loader">Mission loading, machi... 🚀</div>;

  return (
    <div className="status-container">
      <div className="status-header">
        <h2 className="glitch-text">My Mission Control 🚀</h2>
        <p>Current Assignments for <strong>{user?.name || "Employee"}</strong></p>
      </div>

      <div className="tasks-list">
        {tasks.length > 0 ? (
          tasks.map((t) => (
            <div key={t.id} className={`status-card-premium ${t.status} ${t.blocker ? 'has-blocker' : ''}`}>
              
              {/* Header Info */}
              <div className="card-top">
                <div className="title-area">
                  <span className={`badge ${t.status}`}>{t.status}</span>
                  <h3>{t.title}</h3>
                </div>
                {t.pdf_url && (
                  <a href={`${API}/uploads/pdfs/${t.pdf_url}`} target="_blank" rel="noreferrer" className="glass-download-btn">
                    📄 View Assets
                  </a>
                )}
              </div>

              <p className="desc">{t.description}</p>

              {/* Blocker Alert (If already reported) */}
              {t.blocker && (
                <div className="active-blocker-banner">
                  ⚠️ <strong>Reported Blocker:</strong> {t.blocker}
                </div>
              )}
              
              <div className="card-meta">
                <span>🗓️ Due: <strong>{t.dueDate}</strong></span>
                <span>👨‍💻 Boss: <strong>{t.assigned_by}</strong></span>
              </div>

              {/* ACTION AREA */}
              <div className="action-footer">
                {t.status === "pending" ? (
                  <div className="flow-control">
                    {submitting === t.id ? (
                      <div className="submission-form animate-in">
                        <input type="text" placeholder="Live Demo (e.g., Netlify/Vercel)" value={proofLink} onChange={(e) => setProofLink(e.target.value)} />
                        <input type="text" placeholder="GitHub Repository URL" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
                        <div className="btn-row">
                          <button className="confirm-btn" onClick={() => handleSubmitTask(t.id)}>Submit Work</button>
                          <button className="cancel-btn" onClick={() => setSubmitting(null)}>Back</button>
                        </div>
                      </div>
                    ) : blockerReporting === t.id ? (
                      <div className="blocker-form animate-in">
                        <textarea placeholder="Enna issue machi? Describe the blocker..." value={blockerText} onChange={(e) => setBlockerText(e.target.value)} />
                        <div className="btn-row">
                          <button className="report-confirm-btn" onClick={() => handleReportBlocker(t.id)}>Send to Admin</button>
                          <button className="cancel-btn" onClick={() => setBlockerReporting(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="main-btns">
                        <button className="complete-trigger-btn" onClick={() => setSubmitting(t.id)}>🚀 Mark Completed</button>
                        <button className="blocker-trigger-btn" onClick={() => setBlockerReporting(t.id)}>⚠️ Report Blocker</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="completed-info-premium">
                    <p>✅ Mission Accomplished on {t.completed_at}</p>
                    <div className="links-row">
                      <a href={t.proof_link} target="_blank" rel="noreferrer">Live Link</a>
                      <a href={t.github_link} target="_blank" rel="noreferrer">Source Code</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No tasks assigned yet. Chill pannu machi! 😎</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskStatus;