import React, { useState } from "react";
import "./HelpSupport.css";

const API = "http://localhost:5000";

function HelpSupport({ user }) {
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);

  const faqs = [
    {
      q: "How to upload task proof?",
      a: "Go to Pending Tasks, enter your GitHub & Live link, then click 'Submit Work'."
    },
    {
      q: "Attendance not marking?",
      a: "Make sure your location is enabled and you are within the office geo-fence."
    },
    {
      q: "How to request a deadline extension?",
      a: "Use the 'Raise a Ticket' section below to message the Admin directly."
    }
  ];

  const handleRaiseTicket = async () => {
    if (!ticket.trim()) return alert("Type here something you need ✍️");

    setLoading(true);
    try {
      const res = await fetch(`${API}/help/raise-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          name: user?.name,
          message: ticket,
          timestamp: new Date().toISOString()
        }),
      });

      if (res.ok) {
        alert("Ticket raised successfully! ✅");
        setTicket("");
      } else {
        alert("Something went wrong. Try again!");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Check the connection!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hs-root-container">
      <div className="hs-card animate-fade-up">
        
        {/* HEADER SECTION */}
        <div className="hs-card-header">
          <div className="hs-title-group">
            <h3 className="hs-main-title">💡 Knowledge Base</h3>
            <p className="hs-subtitle">Find quick answers or reach out to us.</p>
          </div>
          <span className="hs-status-pill">Live Support</span>
        </div>

        {/* FAQ SECTION */}
        <div className="hs-faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="hs-faq-item">
              <div className="hs-faq-q">
                <span className="hs-q-icon">❓</span>
                <p>{faq.q}</p>
              </div>
              <p className="hs-faq-a">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* TICKET FORM SECTION */}
        <div className="hs-ticket-section">
          <div className="hs-form-label-row">
            <label className="hs-form-label">Direct Support / Raise Ticket</label>
            <span className="hs-char-count">{ticket.length} chars</span>
          </div>
          
          <textarea
            className="hs-textarea"
            placeholder="Describe your issue or doubt here, machi..."
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            rows="4"
          ></textarea>

          <button 
            className="hs-btn-submit" 
            onClick={handleRaiseTicket}
            disabled={loading}
          >
            {loading ? (
              <div className="hs-loader"></div>
            ) : (
              <>Send to Admin <span className="hs-btn-icon">🚀</span></>
            )}
          </button>
        </div>

        {/* FOOTER NOTE */}
        <div className="hs-card-footer">
          <p className="hs-footer-text">
             Average response time: <strong>&lt; 30 mins</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelpSupport;