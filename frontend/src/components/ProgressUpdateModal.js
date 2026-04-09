import React, { useState } from "react";
import "./ProgressUpdateModal.css"; 
import { updateProgress } from "../services/api";
import { X, BarChart2, Send } from "lucide-react"; // Added icons for premium look

function ProgressUpdateModal({ task, onClose, refresh }) {
  const [progress, setProgress] = useState(task?.progress || 0);
  const [updateText, setUpdateText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Submit handler
  const handleSubmit = async () => {
    // Basic validation
    if (progress < 0 || progress > 100) {
      alert("Progress should be between 0 to 100 !");
      return;
    }

    if (!updateText.trim()) {
      alert("Please enter a status update message!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Machi, backend taskId check panniko. Task object-la 'id' iruka 'taskId' irukanu.
      // Usually it's task.id
      const payload = {
        taskId: task?.id || task?._id, // Safety check for both formats
        progress: Number(progress),
        update: updateText
      };

      const response = await updateProgress(payload);

      if (response) {
        alert("Mission Progress Synced Successfully! 🚀");
        if (refresh) refresh(); // Dashboard-ah refresh panna
        if (onClose) onClose(); // Modal-ah close panna (onClose prop fixed)
      }
    } catch (err) {
      console.error("Update error detail:", err);
      alert(`Error: ${err.response?.data?.message || "Something went wrong while syncing progress ❌"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ❌ safety (avoid crash if task null)
  if (!task) return null;

  return (
    <div className="db-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="db-modal-box animate-slide-up" onClick={(e) => e.stopPropagation()}>
        
        {/* MODAL HEADER */}
        <header className="dtms-modal-header">
          <div className="af-brand">
            <div className="af-logo-icon"><BarChart2 size={20} /></div>
            <div>
              <h3 className="dtms-modal-title">Update Mission Progress</h3>
              <p className="dtms-modal-subtitle">Task: <strong>{task.title}</strong></p>
            </div>
          </div>
          <button className="db-close-btn" onClick={onClose} style={{ top: '15px', right: '15px' }}>
            <X size={20} />
          </button>
        </header>

        {/* MODAL BODY */}
        <div className="dtms-modal-body" style={{ padding: '20px' }}>
          
          {/* Progress Slider Group */}
          <div className="dtms-form-group">
            <div className="dtms-label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className="dtms-input-label" style={{ fontWeight: '600' }}>Completion Status</label>
              <span className="db-status completed" style={{ fontSize: '0.85rem' }}>{progress}%</span>
            </div>
            <div className="dtms-slider-container" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="dtms-range-slider"
                style={{ flex: 1, accentColor: '#6366f1' }}
              />
              <input
                type="number"
                value={progress}
                min="0"
                max="100"
                onChange={(e) => setProgress(Number(e.target.value))}
                className="dtms-number-input"
                style={{ 
                    width: '60px', 
                    padding: '8px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}
              />
            </div>
          </div>

          {/* Remarks Group */}
          <div className="dtms-form-group" style={{ marginTop: '20px' }}>
            <label className="dtms-input-label" style={{ fontWeight: '600', display: 'block', marginBottom: '10px' }}>
              Status Update / Remarks
            </label>
            <textarea
              placeholder="Tell us what's happening with this task... (e.g., Coding completed, testing pending)"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              className="dtms-modal-textarea"
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <footer className="dtms-modal-footer" style={{ 
            padding: '20px', 
            borderTop: '1px solid #f1f5f9', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px' 
        }}>
          <button 
            className="db-btn" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="af-btn af-sod-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ padding: '10px 25px' }}
          >
            {isSubmitting ? "Syncing..." : (
                <><Send size={16} /> Sync Progress</>
            )}
          </button>
        </footer>

      </div>
    </div>
  );
}

export default ProgressUpdateModal;