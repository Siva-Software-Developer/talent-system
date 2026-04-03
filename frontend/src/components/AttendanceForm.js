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
  X
} from "lucide-react";
import "./AttendanceForm.css";

function AttendanceForm({ onClose }) {
  const [employeeId, setEmployeeId] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [percentage, setPercentage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // States for Filters & Data
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLogs(); // Initial fetch
    return () => clearInterval(timer);
  }, []);

  const fetchLogs = async () => {
    try {
      // Inga unga API call
      // const res = await getAttendanceLogs();
      // setLogs(res.data);
      
      // Mock data for UI testing
      setLogs([
        { name: "MS DHONI", employeeId: "007", date: "2026-04-01", type: "SOD", time: "09:59 AM" },
        { name: "MS DHONI", employeeId: "007", date: "2026-04-01", type: "EOD", time: "06:01 PM", workDone: "Project UI completed", percentage: "100" },
      ]);
    } catch (err) { console.error("Fetch Error", err); }
  };

  const getMinutes = () => currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // Time checking logic (SOD: 9AM-10AM range, EOD: 6PM-7PM range)
  const isSODTime = () => { const m = getMinutes(); return m >= 540 && m <= 1140; }; 
  const isEODTime = () => { const m = getMinutes(); return m >= 1075 && m <= 1300; };

  const today = currentTime.toLocaleDateString('en-CA'); 
  const timeDisplay = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesName = log.name.toLowerCase().includes(searchTerm.toLowerCase()) || log.employeeId.includes(searchTerm);
    const matchesDate = (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate);
    return matchesName && matchesDate;
  });

  // Summary Logic
  const totalLogins = filteredLogs.filter(l => l.type === "SOD").length;
  const totalLogouts = filteredLogs.filter(l => l.type === "EOD").length;

  const handleSODSubmit = async () => {
    if (!employeeId.trim()) return alert("ID podu machi!");
    const data = { name: user?.name, employeeId, date: today, time: timeDisplay, type: "SOD" };
    try { await submitSOD(data); alert("SOD Success ✅"); fetchLogs(); } catch (err) { alert("Error ❌"); }
  };

  const handleEODSubmit = async () => {
    if (!workDone.trim() || !percentage) return alert("Ellathayum fill pannu machi!");
    const data = { name: user?.name, employeeId, workDone, percentage, date: today, time: timeDisplay, type: "EOD" };
    try { await submitEOD(data); alert("EOD Success ✅"); fetchLogs(); } catch (err) { alert("Error ❌"); }
  };

  return (
    <div className="attendance-modal-overlay">
      <div className="attendance-card-wrapper">
        
        {/* --- MODAL HEADER --- */}
        <header className="attendance-modal-header">
          <div className="header-brand">
            <Activity className="brand-icon" />
            <h2 className="header-title">Log Attendance</h2>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="attendance-layout-grid">
          
          {/* --- LEFT SECTION: STATS & ACTION --- */}
          <section className="attendance-action-panel">
            <div className="dashboard-sub-header">
               <h3 className="sub-header-title">
                  <Activity size={18} /> Attendance Dashboard
               </h3>
               <div className="live-clock-display">
                  <Clock size={14} /> <span>Live Time: <strong>{timeDisplay}</strong></span>
               </div>
            </div>

            <div className="stats-container-row">
              <div className="mini-stat-card sod-accent">
                <div className="stat-icon-circle"><UserCheck size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">SOD COUNT</span>
                  <span className="stat-value">{totalLogins}</span>
                </div>
              </div>
              <div className="mini-stat-card eod-accent">
                <div className="stat-icon-circle"><UserMinus size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">EOD COUNT</span>
                  <span className="stat-value">{totalLogouts}</span>
                </div>
              </div>
            </div>

            <div className="dynamic-form-box">
              <div className="search-filter-wrapper">
                 <div className="search-input-group">
                    <Search className="search-icon" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search Name or Employee ID..." 
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="date-picker-group">
                    <input type="date" onChange={(e) => setStartDate(e.target.value)} />
                    <span className="to-divider">to</span>
                    <input type="date" onChange={(e) => setEndDate(e.target.value)} />
                 </div>
              </div>

              {isSODTime() ? (
                <div className="attendance-status-card sod-mode">
                  <div className="card-header-row">
                    <span className="status-emoji">🌅</span>
                    <h4>Start of Day</h4>
                  </div>
                  <p className="status-instruction">Mark your attendance for today</p>
                  <input 
                    type="text" 
                    className="form-control-dark" 
                    placeholder="Enter Employee ID" 
                    value={employeeId} 
                    onChange={(e) => setEmployeeId(e.target.value)} 
                  />
                  <button className="submit-btn sod-btn" onClick={handleSODSubmit}>
                    <Send size={16} /> Submit SOD
                  </button>
                </div>
              ) : isEODTime() ? (
                <div className="attendance-status-card eod-mode">
                  <div className="card-header-row">
                    <span className="status-emoji">🌙</span>
                    <h4>End of Day</h4>
                  </div>
                  <p className="status-instruction">Report your daily progress</p>
                  <div className="eod-inputs-stack">
                    <input 
                      type="text" 
                      className="form-control-dark" 
                      placeholder="Employee ID" 
                      value={employeeId} 
                      onChange={(e) => setEmployeeId(e.target.value)} 
                    />
                    <textarea 
                      className="form-control-dark" 
                      placeholder="What did you achieve today?" 
                      onChange={(e) => setWorkDone(e.target.value)} 
                    />
                    <input 
                      type="number" 
                      className="form-control-dark" 
                      placeholder="Overall Progress %" 
                      onChange={(e) => setPercentage(e.target.value)} 
                    />
                  </div>
                  <button className="submit-btn eod-btn" onClick={handleEODSubmit}>
                    <Send size={16} /> Submit EOD
                  </button>
                </div>
              ) : (
                <div className="attendance-status-card locked-mode">
                  <Lock className="lock-icon-big" size={40} />
                  <h4>Forms Locked</h4>
                  <p>Entries are allowed only during shift hours machi!</p>
                </div>
              )}
            </div>
          </section>

          {/* --- RIGHT SECTION: ACTIVITY TIMELINE --- */}
          <section className="attendance-timeline-panel">
            <div className="timeline-header-row">
               <ClipboardList size={20} />
               <h3 className="timeline-title">Activity Timeline</h3>
            </div>
            
            <div className="timeline-scroll-area">
              {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                <div key={index} className={`timeline-card-item ${log.type.toLowerCase()}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-body">
                    <div className="timeline-user-meta">
                      <span className="user-name">{log.name}</span>
                      <span className="user-id">#{log.employeeId}</span>
                    </div>
                    <div className="timeline-time-meta">
                      <span className="type-badge">{log.type}</span>
                      <span className="time-text">{log.time}</span>
                      <span className="date-text">{log.date}</span>
                    </div>
                    {log.workDone && (
                      <div className="timeline-task-details">
                        <p className="task-desc"><strong>Tasks:</strong> {log.workDone}</p>
                        <div className="progress-mini-bar">
                          <div className="progress-fill" style={{width: `${log.percentage}%`}}></div>
                          <span className="progress-pct">{log.percentage}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="empty-timeline-msg">
                  <p>No records found machi! 🔎</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default AttendanceForm;