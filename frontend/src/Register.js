import { useState } from "react";
import "./Register.css";

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
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

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
    let res = await fetch(`${API}/register-send-otp`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email: form.email })
    });
    alert((await res.json()).message);
  };

  const register = async () => {
    if (!Object.values(valid).every(Boolean)) {
      alert("Password innum strong-ah illa machi! 🔐");
      return;
    }
    if (!form.role || !form.job || !form.otp) {
      alert("Ellaa details-um fill pannu machi! 📝");
      return;
    }

    let res = await fetch(`${API}/register-verify`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(form)
    });

    let data = await res.json();
    alert(data.message);
    if (res.status === 201) setPage("login");
  };

  return (
    <div className="register-container animate-fade-in">
      <div className="register-header">
        <h2 className="register-title-gradient">Join Us 🚀</h2>
        <p className="register-subtitle">Initialize your professional trajectory</p>
      </div>

      <div className="register-form-grid">
        {/* Personal Info Section */}
        <div className="input-group">
          <input className="premium-input" name="name" placeholder="Full Name" onChange={handleChange}/>
          <input className="premium-input" name="email" placeholder="Email Address" onChange={handleChange}/>
          <input className="premium-input date-input" type="date" name="dob" title="Date of Birth" onChange={handleChange}/>
          <input className="premium-input" type="password" name="password" placeholder="Secure Password" onChange={handleChange}/>
        </div>

        {/* Password Strength Indicators */}
        <div className="strength-tracker">
          <span className={valid.length ? "badge-v" : "badge-i"}>8+ Chars</span>
          <span className={valid.upper ? "badge-v" : "badge-i"}>Upper</span>
          <span className={valid.lower ? "badge-v" : "badge-i"}>Lower</span>
          <span className={valid.number ? "badge-v" : "badge-i"}>Num</span>
          <span className={valid.special ? "badge-v" : "badge-i"}>Sym</span>
        </div>

        {/* Professional Info Section */}
        <div className="input-group-row">
          <select className="premium-input select-styled" name="role" onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>

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

        {/* OTP Section */}
        <div className="otp-verification-row">
          <input className="premium-input otp-field" name="otp" placeholder="Verification OTP" onChange={handleChange}/>
          <button className="btn-send-otp-inline" onClick={sendOtp}>Get OTP</button>
        </div>
      </div>

      <button className="btn-premium register-btn-full" onClick={register}>
        Complete Registration ✨
      </button>

      <div className="register-footer">
        <p className="login-link-text" onClick={()=>setPage("login")}>
          Already have an account? <span className="highlight-text">Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;