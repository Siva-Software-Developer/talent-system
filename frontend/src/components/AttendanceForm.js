import React, { useState, useEffect } from "react";
import { submitSOD, submitEOD, getAttendanceLogs } from "../services/api";
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Activity, 
  UserCheck, 
  UserMinus,
  Lock,
  Send,
  ClipboardList,
  X,
  Target
} from "lucide-react";
import "./AttendanceForm.css";

function AttendanceForm({ onClose }) {
  const [employeeId, setEmployeeId] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [percentage, setPercentage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLogs();
    return () => clearInterval(timer);
  }, []);

  const fetchLogs = async () => {
    try {
      // Mock data for UI - API integrate pannum pothu uncomment panniko machi
      setLogs([
        { name: "MS DHONI", employeeId: "007", date: "2026-04-01", type: "SOD", time: "09:59 AM" },
        { name: "MS DHONI", employeeId: "007", date: "2026-04-01", type: "EOD", time: "06:01 PM", workDone: "Project UI completed", percentage: "100" },
      ]);
    } catch (err) { console.error("Fetch Error", err); }
  };

  const getMinutes = () => currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // SOD: 9AM-7PM (Testing-kaga expand panniruken machi, real time-ku change panniko)
  const isSODTime = () => { const m = getMinutes(); return m >= 540 && m <= 1140; }; 
  const isEODTime = () => { const m = getMinutes(); return m >= 1075 && m <= 1300; };

  const today = currentTime.toLocaleDateString('en-CA'); 
  const timeDisplay = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const filteredLogs = logs.filter(log => {
    const matchesName = log.name.toLowerCase().includes(searchTerm.toLowerCase()) || log.employeeId.includes(searchTerm);
    const matchesDate = (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate);
    return matchesName && matchesDate;
  });

  const totalLogins = filteredLogs.filter(l => l.type === "SOD").length;
  const totalLogouts = filteredLogs.filter(l => l.type === "EOD").length;

  const handleSODSubmit = async () => {
    if (!employeeId.trim()) return alert("Enter your ID");
    try { 
        await submitSOD({ name: user?.name, employeeId, date: today, time: timeDisplay, type: "SOD" }); 
        alert("SOD Success ✅"); fetchLogs(); 
    } catch (err) { alert("Error ❌"); }
  };

  const handleEODSubmit = async () => {
    if (!workDone.trim() || !percentage) return alert("Fill all the Details");
    try { 
        await submitEOD({ name: user?.name, employeeId, workDone, percentage, date: today, time: timeDisplay, type: "EOD" }); 
        alert("EOD Success ✅"); fetchLogs(); 
    } catch (err) { alert("Error ❌"); }
  };

  return (
    <div className="af-overlay">
      <div className="af-wrapper animate-slide-up">
        
        {/* --- HEADER --- */}
        <header className="af-header">
          <div className="af-brand">
            <div className="af-logo-icon"><Activity size={20} /></div>
            <div>
                <h2 className="af-title">Attendance Hub</h2>
                <p className="af-subtitle">Log your shift activity</p>
            </div>
          </div>
          <button className="af-close-btn" onClick={onClose}><X size={20} /></button>
        </header>

        <div className="af-grid">
          
          {/* --- LEFT: ACTIONS --- */}
          <section className="af-action-side">
            <div className="af-time-banner">
              <Clock size={16} className="af-pulse" />
              <span>Current Time: <strong>{timeDisplay}</strong></span>
            </div>

            <div className="af-stat-row">
              <div className="af-mini-card af-sod-bg">
                <UserCheck size={18} />
                <div className="af-stat-info">
                  <span className="af-label">SOD</span>
                  <span className="af-val">{totalLogins}</span>
                </div>
              </div>
              <div className="af-mini-card af-eod-bg">
                <UserMinus size={18} />
                <div className="af-stat-info">
                  <span className="af-label">EOD</span>
                  <span className="af-val">{totalLogouts}</span>
                </div>
              </div>
            </div>

            <div className="af-form-section">
              <div className="af-search-box">
                <Search size={16} />
                <input 
                    type="text" 
                    placeholder="Search by ID/Name..." 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>

              {isSODTime() ? (
                <div className="af-mode-card af-sod-card">
                  <div className="af-mode-head">🌅 Start of Day</div>
                  <div className="af-input-stack">
                    <input 
                        type="text" 
                        placeholder="Your Employee ID" 
                        value={employeeId} 
                        onChange={(e) => setEmployeeId(e.target.value)} 
                    />
                    <button className="af-btn af-sod-btn" onClick={handleSODSubmit}>
                        <Send size={16} /> Mark Login
                    </button>
                  </div>
                </div>
              ) : isEODTime() ? (
                <div className="af-mode-card af-eod-card">
                  <div className="af-mode-head">🌙 End of Day</div>
                  <div className="af-input-stack">
                    <input type="text" placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
                    <textarea placeholder="Work achievements today..." onChange={(e) => setWorkDone(e.target.value)} />
                    <div className="af-pct-input">
                        <Target size={16} />
                        <input type="number" placeholder="Progress %" onChange={(e) => setPercentage(e.target.value)} />
                    </div>
                    <button className="af-btn af-eod-btn" onClick={handleEODSubmit}>
                        <Send size={16} /> Complete Shift
                    </button>
                  </div>
                </div>
              ) : (
                <div className="af-mode-card af-lock-card">
                  <Lock size={32} />
                  <h4>Portal Locked</h4>
                  <p>Attendance can only be marked during shift hours machi!</p>
                </div>
              )}
            </div>
          </section>

          {/* --- RIGHT: TIMELINE --- */}
          <section className="af-timeline-side">
            <div className="af-timeline-head">
               <ClipboardList size={18} /> <h3>Activity Log</h3>
            </div>
            
            <div className="af-timeline-list scrollbar-style">
              {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
                <div key={idx} className={`af-log-item status-${log.type.toLowerCase()}`}>
                  <div className="af-log-meta">
                    <span className="af-log-name">{log.name}</span>
                    <span className={`af-badge ${log.type.toLowerCase()}`}>{log.type}</span>
                  </div>
                  <div className="af-log-time">
                    <Clock size={12} /> {log.time} • {log.date}
                  </div>
                  {log.workDone && (
                    <div className="af-log-task">
                      <p><strong>Work:</strong> {log.workDone}</p>
                      <div className="af-progress-bg">
                        <div className="af-progress-fill" style={{width: `${log.percentage}%`}}></div>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="af-empty">No logs found! 🔎</div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default AttendanceForm;