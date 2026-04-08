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

  // Fetch Tasks Logic
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

  const handleSubmitTask = async (taskId) => {
    if (!proofLink || !githubLink) {
      alert("Proof link and GitHub link both important!");
      return;
    }
    try {
      const response = await fetch(`${API}/employee/complete-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, proof_link: proofLink, github_link: githubLink }),
      });
      const result = await response.json();
      alert(result.message);
      setSubmitting(null);
      setProofLink("");
      setGithubLink("");
      fetchMyTasks();
    } catch (err) {
      alert("Submission failed !");
    }
  };

  const handleReportBlocker = async (taskId) => {
    if (!blockerText) {
      alert("Tell me that what are the issues you faced!");
      return;
    }
    try {
      await fetch(`${API}/employee/report-blocker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, blocker: blockerText }),
      });
      alert("Informed to Admin! 😎");
      setBlockerReporting(null);
      setBlockerText("");
      fetchMyTasks();
    } catch (err) {
      alert("Did not have to blocker!");
    }
  };

  if (loading) return (
    <div className="dtms-loader-wrapper">
      <div className="dtms-spinner"></div>
      <p>Mission loading.🚀</p>
    </div>
  );

  return (
    <div className="dtms-status-container animate-fade-in">
      
      {/* HEADER SECTION */}
      <header className="dtms-status-header">
        <div className="dtms-header-info">
          <h2 className="dtms-title-bold">Mission Control</h2>
          <p className="dtms-subtitle">Current Assignments for <strong>{user?.name || "Employee"}</strong></p>
        </div>
        <div className="dtms-status-stats">
          <div className="dtms-stat-pill">Total: {tasks.length}</div>
        </div>
      </header>

      {/* MISSION GRID */}
      <div className="dtms-mission-grid">
        {tasks.length > 0 ? (
          tasks.map((t) => (
            <div key={t.id} className={`dtms-mission-card status-${t.status} ${t.blocker ? 'dtms-blocked-border' : ''}`}>
              
              {/* TOP STRIP */}
              <div className="dtms-card-top">
                <div className="dtms-badge-row">
                  <span className={`dtms-status-pill pill-${t.status}`}>{t.status}</span>
                  {t.blocker && <span className="dtms-status-pill pill-blocker">⚠️ BLOCKED</span>}
                </div>
                {t.pdf_url && (
                  <a href={`${API}/uploads/pdfs/${t.pdf_url}`} target="_blank" rel="noreferrer" className="dtms-asset-link">
                    📄 Assets
                  </a>
                )}
              </div>

              {/* CARD CONTENT */}
              <div className="dtms-card-body">
                <h3 className="dtms-task-name">{t.title}</h3>
                <p className="dtms-task-desc">{t.description}</p>

                {t.blocker && (
                  <div className="dtms-blocker-alert">
                    <strong>Issue:</strong> {t.blocker}
                  </div>
                )}
              </div>
              
              {/* META ROW */}
              <div className="dtms-card-meta">
                <span>🗓️ Due: <strong>{t.dueDate}</strong></span>
                <span>👨‍💻 Boss: <strong>{t.assigned_by}</strong></span>
              </div>

              {/* FOOTER ACTIONS */}
              <footer className="dtms-card-footer">
                {t.status === "pending" ? (
                  <div className="dtms-action-area">
                    {submitting === t.id ? (
                      <div className="dtms-form-pop animate-slide-up">
                        <input className="dtms-mini-input" type="text" placeholder="Live Demo URL" value={proofLink} onChange={(e) => setProofLink(e.target.value)} />
                        <input className="dtms-mini-input" type="text" placeholder="GitHub URL" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
                        <div className="dtms-flex-row">
                          <button className="dtms-btn-submit" onClick={() => handleSubmitTask(t.id)}>Submit</button>
                          <button className="dtms-btn-back" onClick={() => setSubmitting(null)}>Back</button>
                        </div>
                      </div>
                    ) : blockerReporting === t.id ? (
                      <div className="dtms-form-pop animate-slide-up">
                        <textarea className="dtms-mini-textarea" placeholder="Describe issue..." value={blockerText} onChange={(e) => setBlockerText(e.target.value)} />
                        <div className="dtms-flex-row">
                          <button className="dtms-btn-blocker" onClick={() => handleReportBlocker(t.id)}>Send</button>
                          <button className="dtms-btn-back" onClick={() => setBlockerReporting(null)}>Back</button>
                        </div>
                      </div>
                    ) : (
                      <div className="dtms-default-btns">
                        <button className="dtms-btn-complete" onClick={() => setSubmitting(t.id)}>🚀 Complete</button>
                        <button className="dtms-btn-report" onClick={() => setBlockerReporting(t.id)}>⚠️ Blocker</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="dtms-done-banner">
                    <div className="dtms-done-text">✅ Accomplished on {t.completed_at}</div>
                    <div className="dtms-done-links">
                      <a href={t.proof_link} target="_blank" rel="noreferrer">Live</a>
                      <a href={t.github_link} target="_blank" rel="noreferrer">Code</a>
                    </div>
                  </div>
                )}
              </footer>
            </div>
          ))
        ) : (
          <div className="dtms-empty-state">
            <div className="dtms-empty-icon">🏖️</div>
            <p>No tasks assigned yet 😎</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskStatus;