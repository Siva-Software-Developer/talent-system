import React, { useState, useEffect, useRef } from "react";
import "./AllChat.css";

/* ✅ FIXED API IMPORTS (Using 'as' to match your existing code) */
import { sendMessage, fetchMessages as getMessages } from "../services/api";

import axios from "axios";
/* ✅ UPDATED ALLCHAT ICON IMPORTS */
import { Send, X, Reply, Smile, MessageSquare } from "lucide-react";

const API_BASE = "http://localhost:5000";

function AllChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // 📜 Auto-scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔄 Fetch messages
  const fetchMessagesData = async () => {
    try {
      const res = await getMessages();
      const data = res?.data || [];
      // We keep them in chronological order for chat feel
      setMessages(data); 
    } catch (err) {
      console.error("Fetch messages error:", err);
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

  // 📤 Send message
  const handleSend = async () => {
    if (!message.trim()) {
      alert("Machi, message illama eppidi send pannuva? Type something!");
      return;
    }

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
      reactions: {} // Initialize empty reactions
    };

    try {
      await sendMessage(data);
      setMessage("");
      setReplyTo(null);
      fetchMessagesData();
    } catch (err) {
      console.error("Send error:", err);
      alert("Error sending message ❌");
    }
  };

  // 🔥 Handle Reaction
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
    <div className="allchat-root-container animate-fade-in">
      <div className="allchat-header-section">
        <div className="header-left">
          <MessageSquare className="header-icon" size={20} />
          <h2 className="allchat-main-title">Team Chat & Updates</h2>
        </div>
        <span className="live-indicator">
          <span className="live-dot"></span> LIVE
        </span>
      </div>

      {/* 📨 Messages Display */}
      <div className="allchat-messages-display-area">
        {messages.length === 0 ? (
          <div className="no-messages-placeholder">
            <p className="no-msg-text">No announcements yet, machi... 🏖️</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg.message_id || index} 
              className={`chat-bubble-wrapper ${msg?.sender_email === user?.email ? 'my-message' : ''}`}
            >
              <div 
                className={`chat-bubble-card ${msg?.role === 'admin' ? 'admin-msg-style' : 'user-msg-style'}`}
              >
                {/* 🔥 Reply Preview inside Chat Bubble */}
                {msg.reply_to_text && (
                  <div className="reply-preview-box">
                    <small className="reply-user">@{msg.reply_to_user}</small>
                    <p className="reply-text-truncate">{msg.reply_to_text}</p>
                  </div>
                )}

                <div className="chat-bubble-meta">
                  <span className="chat-sender-name">{msg?.sender}</span>
                  <span className={`chat-role-badge badge-${msg?.role}`}>{msg?.role}</span>
                </div>

                <div className="chat-bubble-content">
                  <p className="chat-main-text">{msg?.text}</p>
                </div>

                {/* 🔥 Reactions Row */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="reactions-display">
                    {Object.entries(msg.reactions).map(([email, emoji], i) => (
                      <span key={i} className="mini-emoji-pill" title={email}>
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}

                <div className="chat-bubble-footer">
                  <span className="chat-timestamp">{msg?.time}</span>
                  <div className="bubble-actions">
                    <button 
                      className="bubble-action-btn"
                      onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)}
                    >
                      <Smile size={14} />
                    </button>
                    <button 
                      className="bubble-action-btn" 
                      onClick={() => setReplyTo(msg)}
                    >
                      <Reply size={14} /> Reply
                    </button>
                  </div>
                </div>

                {/* 🔥 Emoji Picker Floating UI */}
                {showEmojiPicker === index && (
                  <div className="emoji-floating-bar scale-in">
                    {["👍", "❤️", "😂", "🔥", "🙏"].map((emoji) => (
                      <span 
                        key={emoji} 
                        className="emoji-item"
                        onClick={() => handleReact(msg.message_id, emoji)}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ✍️ Input Section */}
      <div className="allchat-input-control-panel">
        {/* 🔥 Active Reply Preview Bar */}
        {replyTo && (
          <div className="active-reply-bar slide-up">
            <div className="reply-info">
              <Reply size={14} />
              <span>Replying to <b>{replyTo.sender}</b></span>
            </div>
            <button className="cancel-reply-btn" onClick={() => setReplyTo(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="input-wrapper-inner">
          <input
            type="text"
            className="chat-text-input-field"
            placeholder={replyTo ? `Reply to ${replyTo.sender}...` : "Type a message, machi..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-send-action-btn" onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllChat;