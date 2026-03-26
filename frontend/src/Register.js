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
    let res = await fetch(`${API}/register-send-otp`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email: form.email })
    });
    alert((await res.json()).message);
  };

  const register = async () => {
    if (!Object.values(valid).every(Boolean)) {
      alert("Password not strong enough!");
      return;
    }
    if (!form.role || !form.job) {
      alert("Please select role and job!");
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
    <div className="register-content">
      <h2 className="text-gradient">Join Us 🚀</h2>
      <p className="subtitle">Create your professional profile</p>

      <div className="form-grid">
        <input className="premium-input" name="name" placeholder="Full Name" onChange={handleChange}/>
        <input className="premium-input" name="email" placeholder="Email Address" onChange={handleChange}/>
        <input className="premium-input" type="date" name="dob" onChange={handleChange}/>
        <input className="premium-input" type="password" name="password" placeholder="Create Password" onChange={handleChange}/>
      </div>

      <div className="password-check">
        <p className={valid.length ? "valid" : "invalid"}>8+ Chars</p>
        <p className={valid.upper ? "valid" : "invalid"}>Uppercase</p>
        <p className={valid.lower ? "valid" : "invalid"}>Lowercase</p>
        <p className={valid.number ? "valid" : "invalid"}>Number</p>
        <p className={valid.special ? "valid" : "invalid"}>Symbol</p>
      </div>

      <div className="form-grid">
        <select className="premium-input" name="role" onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
        </select>

        <select className="premium-input" name="job" onChange={handleChange}>
          <option value="">Select Job Role</option>
          <optgroup label="Development">
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
          </optgroup>
          <optgroup label="Management">
            <option>Project Manager</option>
            <option>Team Lead</option>
          </optgroup>
          {/* Add more optgroups as needed */}
        </select>
      </div>

      <div className="otp-group">
        <button className="btn-otp" onClick={sendOtp}>Send OTP</button>
        <input className="premium-input" name="otp" placeholder="Enter OTP" onChange={handleChange}/>
      </div>

      <button className="btn-premium" onClick={register}>Complete Registration ✨</button>

      <p className="back-link" onClick={()=>setPage("login")}>
        Already have account? <span>Login</span>
      </p>
    </div>
  );
}

export default Register;