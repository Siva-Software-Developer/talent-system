import React, { useState } from "react";
import "./Register.css";
import { UserPlus, ShieldCheck, Mail, Briefcase, Calendar, Key, CheckCircle2, User } from "lucide-react";

const API = "http://localhost:5000";

function Register({ setPage }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    otp: "",
    role: "",
    job: ""
  });

  const [valid, setValid] = useState({
    length: false, upper: false, lower: false, number: false, special: false
  });

  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setValid({
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*]/.test(value)
      });
    }
    setForm({ ...form, [name]: value });
  };

  const sendOtp = async () => {
    if (!form.email) return alert("Please enter your email 📧");
    setOtpLoading(true);
    try {
      let res = await fetch(`${API}/register-send-otp`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: form.email })
      });
      let data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("OTP Send failed!");
    } finally {
      setOtpLoading(false);
    }
  };

  const register = async () => {
    if (!Object.values(valid).every(Boolean)) {
      alert("Password does not strong! 🔐 Check the badges.");
      return;
    }
    if (!form.role || !form.job || !form.otp || !form.name) {
      alert("Please fill all the details! 📝");
      return;
    }

    try {
      let res = await fetch(`${API}/register-verify`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form)
      });

      let data = await res.json();
      alert(data.message);
      if (res.status === 201) setPage("login");
    } catch (err) {
      alert("Registration error!");
    }
  };

  return (
    <div className="dtms-auth-wrapper dtms-register-page">
      <div className="dtms-register-card">
        
        {/* 🏢 BRANDING & HEADER */}
        <div className="dtms-header-section">
          <div className="dtms-logo-box">
            <UserPlus size={36} strokeWidth={1.5} color="#fff" />
          </div>
          <h1 className="dtms-main-title">Digital Talent Management System</h1>
          <p className="dtms-tagline">Create your professional account</p>
        </div>

        <hr className="dtms-divider" />

        {/* 📋 SCROLLABLE FORM */}
        <div className="dtms-form-scroll-container">
          <div className="dtms-form-grid">
            
            {/* Full Name */}
            <div className="dtms-input-group">
              <label className="dtms-label">Full Name</label>
              <div className="dtms-input-relative">
                <User className="dtms-input-icon" size={16} />
                <input 
                  className="dtms-input-field" 
                  name="name" 
                  placeholder="Enter your full name" 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="dtms-input-group">
              <label className="dtms-label">Corporate Email</label>
              <div className="dtms-input-relative">
                <Mail className="dtms-input-icon" size={16} />
                <input 
                  className="dtms-input-field" 
                  name="email" 
                  placeholder="name@company.com" 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="dtms-input-group">
              <label className="dtms-label">Date of Birth</label>
              <div className="dtms-input-relative">
                <Calendar className="dtms-input-icon" size={16} />
                <input 
                  className="dtms-input-field dtms-date-picker" 
                  type="date" 
                  name="dob" 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="dtms-input-group">
              <label className="dtms-label">Secure Password</label>
              <div className="dtms-input-relative">
                <Key className="dtms-input-icon" size={16} />
                <input 
                  className="dtms-input-field" 
                  type="password" 
                  name="password" 
                  placeholder="Create a strong password" 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Strength Badges */}
            <div className="dtms-strength-badges">
              {Object.entries(valid).map(([key, isV]) => (
                <span key={key} className={isV ? "dtms-badge-valid" : "dtms-badge-invalid"}>
                  {isV && <CheckCircle2 size={10} style={{ marginRight: '4px' }} />} 
                  {key === 'length' ? '8+ Chars' : key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              ))}
            </div>

            {/* Role & Job Selection */}
            <div className="dtms-input-row">
              <div className="dtms-input-group dtms-flex-1">
                <label className="dtms-label">System Role</label>
                <div className="dtms-input-relative">
                  <ShieldCheck className="dtms-input-icon" size={16} />
                  <select className="dtms-input-field dtms-select-field" name="role" onChange={handleChange}>
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
              </div>

              <div className="dtms-input-group dtms-flex-1">
                <label className="dtms-label">Job Title</label>
                <div className="dtms-input-relative">
                  <Briefcase className="dtms-input-icon" size={16} />
                  <select className="dtms-input-field dtms-select-field" name="job" onChange={handleChange}>
                    <option value="">Job Role</option>
                    <optgroup label="Development">
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>Full Stack Developer</option>
                    </optgroup>
                    <optgroup label="Management">
                      <option>Project Manager</option>
                      <option>Team Lead</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* OTP Section */}
            <div className="dtms-input-group">
              <label className="dtms-label">Security Verification</label>
              <div className="dtms-otp-layout">
                <input 
                  className="dtms-input-field dtms-otp-input" 
                  name="otp" 
                  placeholder="Enter OTP" 
                  onChange={handleChange}
                />
                <button 
                  className={`dtms-otp-btn ${otpLoading ? 'dtms-spinning' : ''}`} 
                  onClick={sendOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? "..." : "Get OTP"}
                </button>
              </div>
            </div>
          </div>

          {/* Complete Registration Button */}
          <button className="dtms-primary-btn dtms-register-btn" onClick={register}>
            COMPLETE REGISTRATION
          </button>
        </div>

        {/* 🔗 FOOTER NAVIGATION */}
        <div className="dtms-footer-links">
          <p className="dtms-link" onClick={() => setPage("login")}>
            Already have an account? <span className="dtms-link-bold">Sign In</span>
          </p>
        </div>

        <div className="dtms-system-footer">
          <p>© 2026 DTMS Infrastructure. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Register;