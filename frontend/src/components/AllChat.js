import React, { useState, useEffect } from "react";
import "./AllChat.css";
import { sendMessage, getMessages } from "../services/api";

function AllChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // 🔄 Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await getMessages();

      // ✅ Safety check (avoid undefined crash)
      const data = res?.data || [];

      // latest first
      setMessages([...data].reverse());
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  useEffect(() => {
    fetchMessages();

    // 🔁 Auto refresh every 5 sec
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // 📤 Send message (Admin only)
  const handleSend = async () => {
    if (!message.trim()) {
      alert("Enter message da machi!");
      return;
    }

    const data = {
      text: message,
      sender: user?.name || "Admin",
      role: user?.role || "admin",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
    };

    try {
      await sendMessage(data);
      setMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Send message error:", err);
      alert("Error sending message ❌");
    }
  };

  return (
    <div className="allchat-root-container">
      <div className="allchat-header-section">
        <h2 className="allchat-main-title">📢 Announcements</h2>
        <span className="live-indicator">LIVE</span>
      </div>

      {/* 📨 Messages Box */}
      <div className="allchat-messages-display-area">
        {messages.length === 0 ? (
          <div className="no-messages-placeholder">
            <p className="no-msg-text">No announcements yet, machi...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-bubble-card ${msg?.role === 'admin' ? 'admin-msg-style' : 'user-msg-style'}`}
            >
              <div className="chat-bubble-meta">
                <span className="chat-sender-name">{msg?.sender}</span>
                <span className="chat-sender-role-badge">{msg?.role}</span>
              </div>

              <div className="chat-bubble-content">
                <p className="chat-main-text">{msg?.text}</p>
              </div>

              <div className="chat-bubble-footer">
                <span className="chat-timestamp">{msg?.date} | {msg?.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✍️ Admin Input Section */}
      {user?.role === "admin" && (
        <div className="allchat-input-control-panel">
          <div className="input-wrapper-inner">
            <input
              type="text"
              className="chat-text-input-field"
              placeholder="Post a new update..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="chat-send-action-btn" onClick={handleSend}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllChat;