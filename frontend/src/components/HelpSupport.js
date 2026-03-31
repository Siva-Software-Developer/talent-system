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
    if (!ticket.trim()) return alert("Machi, edhavathu type pannu! ✍️");

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
        alert("Ticket raised successfully! Admin kitta solliduren machi. ✅");
        setTicket("");
      } else {
        alert("Something went wrong. Try again machi!");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Connection check pannu machi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="help-support-card animate-slide-in">
      <div className="help-card-header">
        <h3 className="help-card-title">💡 Knowledge Base</h3>
        <span className="help-status-online">Live Support</span>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <p className="faq-question">❓ {faq.q}</p>
            <p className="faq-answer">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="support-ticket-form">
        <label className="support-label">Direct Support / Raise Ticket</label>
        <textarea
          className="support-textarea"
          placeholder="Describe your issue or doubt here, machi..."
          value={ticket}
          onChange={(e) => setTicket(e.target.value)}
        ></textarea>
        <button 
          className="btn-send-ticket" 
          onClick={handleRaiseTicket}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send to Admin 🚀"}
        </button>
      </div>

      <div className="help-footer-note">
        <p>Average response time: &lt; 30 mins</p>
      </div>
    </div>
  );
}

export default HelpSupport;