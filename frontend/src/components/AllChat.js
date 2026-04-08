import React, { useState, useEffect, useRef } from "react";
import "./AllChat.css";
import { sendMessage, fetchMessages as getMessages } from "../services/api";
import axios from "axios";
import { Send, X, Reply, Smile, MessageSquare, ShieldCheck, User } from "lucide-react";

const API_BASE = "http://localhost:5000";

// onClose prop-ah add panniruken machi
function AllChat({ onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessagesData = async () => {
    try {
      const res = await getMessages();
      setMessages(res?.data || []); 
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMessagesData();
    const interval = setInterval(fetchMessagesData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const data = {
      message_id: `msg_${Date.now()}`, 
      text: message,
      sender: user?.name || "User",
      sender_email: user?.email,
      role: user?.role || "employee",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      parent_id: replyTo ? replyTo.message_id : null,
      reply_to_text: replyTo ? replyTo.text : null,
      reply_to_user: replyTo ? replyTo.sender : null,
      reactions: {} 
    };

    try {
      await sendMessage(data);
      setMessage("");
      setReplyTo(null);
      fetchMessagesData();
    } catch (err) {
      alert("Error sending message ❌");
    }
  };

  const handleReact = async (msgId, emoji) => {
    try {
      await axios.post(`${API_BASE}/messages/react`, {
        message_id: msgId,
        email: user?.email,
        emoji: emoji
      });
      setShowEmojiPicker(null);
      fetchMessagesData();
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  return (
    // Height and layout-ah dashboard overlay-ku yetha mathiri fix panniten
    <div className="ac-root animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* --- Header Section --- */}
      <header className="ac-header">
        <div className="ac-header-left">
          <div className="ac-logo-bg"><MessageSquare size={18} /></div>
          <div>
            <h2 className="ac-main-title">Team Workspace</h2>
            <p className="ac-subtitle">Connect with your team</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="ac-live-pill">
            <span className="ac-dot"></span> LIVE
          </div>
          {/* AdminDashboard-la irunthu close panna intha button help pannum */}
          {onClose && (
            <button onClick={onClose} className="ac-close-top-btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '5px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* --- Messages Area --- */}
      <div className="ac-chat-viewport" style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {messages.length === 0 ? (
          <div className="ac-empty-state">
            <div className="ac-empty-icon">🏖️</div>
            <p>No messages yet, machi!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg.message_id || index} 
              className={`ac-bubble-row ${msg?.sender_email === user?.email ? 'ac-mine' : 'ac-theirs'}`}
            >
              <div className="ac-bubble-card">
                {msg.reply_to_text && (
                  <div className="ac-reply-thread">
                    <span className="ac-reply-user">@{msg.reply_to_user}</span>
                    <p className="ac-reply-snippet">{msg.reply_to_text}</p>
                  </div>
                )}

                <div className="ac-bubble-meta">
                  <span className="ac-sender-name">{msg?.sender}</span>
                  {msg?.role === 'admin' ? <ShieldCheck size={12} className="ac-admin-icon" /> : <User size={12} />}
                </div>

                <div className="ac-bubble-body">
                  <p className="ac-text">{msg?.text}</p>
                </div>

                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="ac-reactions-row">
                    {Object.entries(msg.reactions).map(([email, emoji], i) => (
                      <span key={i} className="ac-mini-emoji" title={email}>{emoji}</span>
                    ))}
                  </div>
                )}

                <div className="ac-bubble-footer">
                  <span className="ac-time">{msg?.time}</span>
                  <div className="ac-bubble-actions">
                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)}>
                      <Smile size={14} />
                    </button>
                    <button onClick={() => setReplyTo(msg)}>
                      <Reply size={14} /> Reply
                    </button>
                  </div>
                </div>

                {showEmojiPicker === index && (
                  <div className="ac-emoji-picker-float">
                    {["👍", "❤️", "😂", "🔥", "🙏"].map((emoji) => (
                      <span key={emoji} onClick={() => handleReact(msg.message_id, emoji)}>{emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Section --- */}
      <footer className="ac-input-section" style={{ padding: '15px', background: '#fff', borderTop: '1px solid #eee' }}>
        {replyTo && (
          <div className="ac-active-reply">
            <div className="ac-reply-label">
              <Reply size={14} /> <span>Replying to <b>{replyTo.sender}</b></span>
            </div>
            <button onClick={() => setReplyTo(null)}><X size={14} /></button>
          </div>
        )}

        <div className="ac-input-bar">
          <input
            type="text"
            className="ac-text-field"
            placeholder={replyTo ? "Type a reply..." : "Type a message"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="ac-send-btn" onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default AllChat;