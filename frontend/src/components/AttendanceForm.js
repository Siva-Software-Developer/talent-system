import React, { useState, useEffect } from "react";
import "./AttendanceForm.css";
import { submitSOD, submitEOD } from "../services/api";

function AttendanceForm() {
  const [employeeId, setEmployeeId] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [percentage, setPercentage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // ⏰ Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ⏱ Convert time to minutes for logic
  const getMinutes = () => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  };

  // 🟢 SOD Time (9:55 → 10:05)
  const isSODTime = () => {
    const minutes = getMinutes();
    return minutes >= 595 && minutes <= 605;
  };

  // 🔴 EOD Time (5:55 → 6:05)
  const isEODTime = () => {
    const minutes = getMinutes();
    return minutes >= 1075 && minutes <= 1085;
  };

  const today = currentTime.toLocaleDateString();
  const time = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ✅ Submit SOD
  const handleSODSubmit = async () => {
    if (!employeeId.trim()) {
      alert("Enter Employee ID da machi!");
      return;
    }

    const data = {
      name: user?.name || "Employee",
      employeeId,
      date: today,
      time,
      type: "SOD",
    };

    try {
      await submitSOD(data);
      alert("SOD Submitted Successfully ✅");
      setEmployeeId("");
    } catch (err) {
      console.error("SOD Error:", err);
      alert("Error submitting SOD ❌");
    }
  };

  // ✅ Submit EOD
  const handleEODSubmit = async () => {
    if (!employeeId.trim() || !workDone.trim() || !percentage) {
      alert("Fill all fields da machi!");
      return;
    }

    const data = {
      name: user?.name || "Employee",
      employeeId,
      workDone,
      percentage,
      date: today,
      time,
      type: "EOD",
    };

    try {
      await submitEOD(data);
      alert("EOD Submitted Successfully ✅");
      setEmployeeId("");
      setWorkDone("");
      setPercentage("");
    } catch (err) {
      console.error("EOD Error:", err);
      alert("Error submitting EOD ❌");
    }
  };

  return (
    <div className="attendance-root-wrapper">
      
      <div className="attendance-header">
        <h2 className="attendance-main-title">🕒 Daily Attendance</h2>
        <div className="live-clock-display">
          <span className="clock-label">Current Time:</span>
          <span className="clock-value">{time}</span>
        </div>
      </div>

      <div className="attendance-user-info-card">
        <div className="info-item">
          <span className="info-label">Name:</span>
          <span className="info-value">{user?.name || "Employee"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Today's Date:</span>
          <span className="info-value">{today}</span>
        </div>
      </div>

      {/* 🟢 SOD FORM */}
      {isSODTime() && (
        <div className="attendance-form-card sod-form-theme">
          <div className="form-heading-group">
            <h3 className="form-type-title">🌅 Morning Login (SOD)</h3>
            <p className="form-subtitle">Register your start of day</p>
          </div>

          <div className="attendance-input-group">
            <input
              className="attendance-text-input"
              type="text"
              placeholder="Enter Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <button className="attendance-submit-btn sod-btn" onClick={handleSODSubmit}>
            Submit SOD
          </button>
        </div>
      )}

      {/* 🔴 EOD FORM */}
      {isEODTime() && (
        <div className="attendance-form-card eod-form-theme">
          <div className="form-heading-group">
            <h3 className="form-type-title">🌙 Evening Logout (EOD)</h3>
            <p className="form-subtitle">Submit your daily work summary</p>
          </div>

          <div className="attendance-input-group">
            <input
              className="attendance-text-input"
              type="text"
              placeholder="Enter Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            
            <textarea
              className="attendance-textarea-input"
              placeholder="Describe work done today..."
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              rows="4"
            />
            
            <div className="percentage-input-wrapper">
              <label className="input-inner-label">% Progress Completed:</label>
              <input
                className="attendance-number-input"
                type="number"
                placeholder="e.g. 100"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
            </div>
          </div>

          <button className="attendance-submit-btn eod-btn" onClick={handleEODSubmit}>
            Submit EOD
          </button>
        </div>
      )}

      {/* ❌ Outside Time Message */}
      {!isSODTime() && !isEODTime() && (
        <div className="attendance-closed-state">
          <div className="lock-icon">🔒</div>
          <p className="closed-main-text">Attendance Forms are currently locked.</p>
          <p className="closed-sub-text">
            Available: <strong>9:55–10:05 AM</strong> & <strong>5:55–6:05 PM</strong>
          </p>
        </div>
      )}

    </div>
  );
}

export default AttendanceForm;