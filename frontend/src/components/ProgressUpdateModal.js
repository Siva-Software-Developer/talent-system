import React, { useState } from "react";
import "./ProgressUpdateModal.css"; 
import { updateProgress } from "../services/api";

function ProgressUpdateModal({ task, close, refresh }) {
  const [progress, setProgress] = useState(task?.progress || 0);
  const [updateText, setUpdateText] = useState("");

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (progress < 0 || progress > 100) {
      alert("Progress should be between 0 to 100 !");
      return;
    }

    if (!updateText.trim()) {
      alert("Enter update message!");
      return;
    }

    try {
      await updateProgress({
        taskId: task?.id,
        progress,
        update: updateText
      });

      alert("Progress Updated Successfully ✅");
      refresh(); // reload tasks in Dashboard
      close();   // close modal
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating progress ❌");
    }
  };

  // ❌ safety (avoid crash if task null)
  if (!task) return null;

  return (
    <div className="dtms-modal-overlay animate-fade-in">
      <div className="dtms-modal-card animate-slide-up">
        
        {/* MODAL HEADER */}
        <header className="dtms-modal-header">
          <div className="dtms-modal-icon">📊</div>
          <div className="dtms-modal-info">
            <h3 className="dtms-modal-title">Update Mission Progress</h3>
            <p className="dtms-modal-subtitle">Task: <strong>{task.title}</strong></p>
          </div>
          <button className="dtms-close-x" onClick={close}>&times;</button>
        </header>

        {/* MODAL BODY */}
        <div className="dtms-modal-body">
          
          {/* Progress Slider Group */}
          <div className="dtms-form-group">
            <div className="dtms-label-row">
              <label className="dtms-input-label">Completion Status</label>
              <span className="dtms-percentage-badge">{progress}%</span>
            </div>
            <div className="dtms-slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="dtms-range-slider"
              />
              <input
                type="number"
                value={progress}
                min="0"
                max="100"
                onChange={(e) => setProgress(Number(e.target.value))}
                className="dtms-number-input"
              />
            </div>
          </div>

          {/* Remarks Group */}
          <div className="dtms-form-group">
            <label className="dtms-input-label">Status Update / Remarks</label>
            <textarea
              placeholder="Tell us what's happening with this task"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              className="dtms-modal-textarea"
              rows="4"
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <footer className="dtms-modal-footer">
          <button className="dtms-btn-secondary" onClick={close}>Cancel</button>
          <button className="dtms-btn-primary-modal" onClick={handleSubmit}>
            Sync Progress
          </button>
        </footer>

      </div>
    </div>
  );
}

export default ProgressUpdateModal;