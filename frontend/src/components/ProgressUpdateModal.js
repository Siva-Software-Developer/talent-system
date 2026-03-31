import React, { useState } from "react";
import "./ProgressUpdateModal.css"; 
import { updateProgress } from "../services/api";

function ProgressUpdateModal({ task, close, refresh }) {
  const [progress, setProgress] = useState(task?.progress || 0);
  const [updateText, setUpdateText] = useState("");

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (progress < 0 || progress > 100) {
      alert("Progress should be between 0 to 100 da machi!");
      return;
    }

    if (!updateText.trim()) {
      alert("Enter update message da machi!");
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
    <div className="modal-glass-overlay">

      <div className="modal-content-wrapper">
        
        <div className="modal-header-section">
          <h3 className="modal-main-title">📊 Update Task Progress</h3>
          <p className="modal-task-name">Task: <strong>{task.title}</strong></p>
        </div>

        <div className="modal-body-form">
          {/* Progress Input Group */}
          <div className="modal-input-group">
            <label className="modal-field-label">Completion Percentage (%)</label>
            <div className="modal-progress-input-wrapper">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="modal-range-slider"
              />
              <input
                type="number"
                value={progress}
                min="0"
                max="100"
                onChange={(e) => setProgress(Number(e.target.value))}
                className="modal-number-box"
              />
            </div>
          </div>

          {/* Update Text Group */}
          <div className="modal-input-group">
            <label className="modal-field-label">Status Update / Remarks</label>
            <textarea
              placeholder="Tell us what's happening with this task da machi..."
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              className="modal-status-textarea"
              rows="4"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-footer-actions">
          <button className="modal-btn-cancel" onClick={close}>
            Cancel
          </button>
          <button className="modal-btn-submit" onClick={handleSubmit}>
            Update Progress
          </button>
        </div>

      </div>

    </div>
  );
}

export default ProgressUpdateModal;