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

  // 3. REPORT BLOCKER
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

  if (loading) return (
    <div className="status-loader-container">
      <div className="status-spinner"></div>
      <p className="status-loader-text">Mission loading, machi... 🚀</p>
    </div>
  );

  return (
    <div className="task-status-root">
      
      {/* HEADER AREA */}
      <header className="status-header-section">
        <div className="header-text-group">
          <h2 className="status-glitch-title" data-text="My Mission Control">My Mission Control 🚀</h2>
          <p className="status-welcome-sub">Current Assignments for <span className="highlight-name">{user?.name || "Employee"}</span></p>
        </div>
      </header>

      {/* TASKS LIST */}
      <div className="mission-tasks-grid">
        {tasks.length > 0 ? (
          tasks.map((t) => (
            <div key={t.id} className={`mission-task-card status-${t.status} ${t.blocker ? 'is-blocked' : ''}`}>
              
              {/* TOP STRIP */}
              <div className="mission-card-top">
                <div className="mission-badge-group">
                  <span className={`mission-pill pill-${t.status}`}>{t.status}</span>
                  {t.blocker && <span className="mission-pill pill-blocker">⚠️ Blocked</span>}
                </div>
                {t.pdf_url && (
                  <a href={`${API}/uploads/pdfs/${t.pdf_url}`} target="_blank" rel="noreferrer" className="mission-asset-link">
                    📄 View Assets
                  </a>
                )}
              </div>

              {/* TASK CONTENT */}
              <div className="mission-card-body">
                <h3 className="mission-task-title">{t.title}</h3>
                <p className="mission-task-desc">{t.description}</p>

                {t.blocker && (
                  <div className="mission-blocker-alert">
                    <span className="blocker-icon">🚫</span>
                    <p><strong>Blocker:</strong> {t.blocker}</p>
                  </div>
                )}
              </div>
              
              {/* META INFO */}
              <div className="mission-card-meta">
                <div className="meta-item">
                  <span className="meta-icon">🗓️</span>
                  <span>Due: <strong>{t.dueDate}</strong></span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👨‍💻</span>
                  <span>Boss: <strong>{t.assigned_by}</strong></span>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <footer className="mission-card-footer">
                {t.status === "pending" ? (
                  <div className="mission-action-wrapper">
                    
                    {/* SUBMISSION FORM */}
                    {submitting === t.id ? (
                      <div className="mission-form-overlay animate-slide-up">
                        <input className="mission-input" type="text" placeholder="🔗 Live Demo (Netlify/Vercel)" value={proofLink} onChange={(e) => setProofLink(e.target.value)} />
                        <input className="mission-input" type="text" placeholder="🐙 GitHub Repo URL" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
                        <div className="mission-btn-group">
                          <button className="btn-confirm-submit" onClick={() => handleSubmitTask(t.id)}>Submit Work</button>
                          <button className="btn-cancel-action" onClick={() => setSubmitting(null)}>Back</button>
                        </div>
                      </div>
                    ) 
                    /* BLOCKER FORM */
                    : blockerReporting === t.id ? (
                      <div className="mission-form-overlay animate-slide-up">
                        <textarea className="mission-textarea" placeholder="Enna issue machi? Describe the blocker..." value={blockerText} onChange={(e) => setBlockerText(e.target.value)} />
                        <div className="mission-btn-group">
                          <button className="btn-confirm-blocker" onClick={() => handleReportBlocker(t.id)}>Report Issue</button>
                          <button className="btn-cancel-action" onClick={() => setBlockerReporting(null)}>Cancel</button>
                        </div>
                      </div>
                    ) 
                    /* DEFAULT BUTTONS */
                    : (
                      <div className="mission-primary-actions">
                        <button className="btn-trigger-complete" onClick={() => setSubmitting(t.id)}>🚀 Mark Completed</button>
                        <button className="btn-trigger-blocker" onClick={() => setBlockerReporting(t.id)}>⚠️ Report Blocker</button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* COMPLETED STATE */
                  <div className="mission-completed-view">
                    <div className="success-banner">
                      <span className="check-icon">✅</span>
                      <span>Mission Accomplished on {t.completed_at}</span>
                    </div>
                    <div className="mission-link-row">
                      <a href={t.proof_link} target="_blank" rel="noreferrer" className="mission-ext-link">Live Link</a>
                      <a href={t.github_link} target="_blank" rel="noreferrer" className="mission-ext-link">Source Code</a>
                    </div>
                  </div>
                )}
              </footer>
            </div>
          ))
        ) : (
          <div className="mission-empty-state">
            <div className="empty-icon">🏖️</div>
            <p>No tasks assigned yet. Chill pannu machi! 😎</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskStatus;