import React, { useState } from "react";
import "./Register.css";
import { UserPlus, ShieldCheck, Mail, Briefcase, Calendar, Key, CheckCircle2 } from "lucide-react";

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
    if (!form.email) return alert("Email podu machi! 📧");
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
      alert("OTP Send failed da machi!");
    } finally {
      setOtpLoading(false);
    }
  };

  const register = async () => {
    if (!Object.values(valid).every(Boolean)) {
      alert("Password innum strong-ah illa machi! 🔐 Check the badges.");
      return;
    }
    if (!form.role || !form.job || !form.otp || !form.name) {
      alert("Ellaa details-um fill pannu machi! 📝");
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
      alert("Registration error machi!");
    }
  };

  return (
    <div className="register-glass-wrapper animate-fade-in">
      <div className="register-container">
        <div className="register-header">
          <div className="register-logo-circle">
            <UserPlus size={32} color="#818cf8" />
          </div>
          <h2 className="register-title-gradient">Join Us 🚀</h2>
          <p className="register-subtitle">Initialize your professional trajectory</p>
        </div>

        <div className="register-form-scrollable">
          <div className="register-form-grid">
            {/* Input Groups with Icons */}
            <div className="input-icon-container">
              <Mail className="input-inner-icon" size={16} />
              <input className="premium-input with-icon" name="name" placeholder="Full Name" onChange={handleChange}/>
            </div>

            <div className="input-icon-container">
              <Mail className="input-inner-icon" size={16} />
              <input className="premium-input with-icon" name="email" placeholder="Email Address" onChange={handleChange}/>
            </div>

            <div className="input-icon-container">
              <Calendar className="input-inner-icon" size={16} />
              <input className="premium-input with-icon date-input" type="date" name="dob" onChange={handleChange}/>
            </div>

            <div className="input-icon-container">
              <Key className="input-inner-icon" size={16} />
              <input className="premium-input with-icon" type="password" name="password" placeholder="Secure Password" onChange={handleChange}/>
            </div>

            {/* Password Strength Badges */}
            <div className="strength-tracker-modern">
              {Object.entries(valid).map(([key, isV]) => (
                <span key={key} className={isV ? "badge-v" : "badge-i"}>
                  {isV && <CheckCircle2 size={10} />} {key === 'length' ? '8+ Chars' : key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              ))}
            </div>

            {/* Role & Job Selection */}
            <div className="input-group-row">
              <div className="select-wrapper">
                <ShieldCheck className="select-icon" size={16} />
                <select className="premium-input select-styled" name="role" onChange={handleChange}>
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              <div className="select-wrapper">
                <Briefcase className="select-icon" size={16} />
                <select className="premium-input select-styled" name="job" onChange={handleChange}>
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

            {/* OTP Section */}
            <div className="otp-container">
              <input className="premium-input otp-field" name="otp" placeholder="Verification OTP" onChange={handleChange}/>
              <button 
                className={`btn-send-otp-inline ${otpLoading ? 'spinning' : ''}`} 
                onClick={sendOtp}
                disabled={otpLoading}
              >
                {otpLoading ? "..." : "Get OTP"}
              </button>
            </div>
          </div>

          <button className="btn-premium register-btn-full" onClick={register}>
            Complete Registration ✨
          </button>
        </div>

        <div className="register-footer">
          <p className="login-link-text" onClick={()=>setPage("login")}>
            Already have an account? <span className="highlight-text-glow">Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;