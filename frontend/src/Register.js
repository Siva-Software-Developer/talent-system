import { useState } from "react";

const API = "http://localhost:5000";

function Register({ setPage }) {

  // ===========================
  // 📌 FORM STATE
  // ===========================
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    otp: "",
    role: "",     // ✅ ADDED
    job: ""       // ✅ ADDED
  });

  // ===========================
  // 🔐 PASSWORD VALIDATION
  // ===========================
  const [valid, setValid] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  // ===========================
  // 🔄 HANDLE INPUT CHANGE
  // ===========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Password validation
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

  // ===========================
  // 📧 SEND OTP
  // ===========================
  const sendOtp = async () => {
    let res = await fetch(`${API}/register-send-otp`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email: form.email })
    });

    alert((await res.json()).message);
  };

  // ===========================
  // 📝 REGISTER
  // ===========================
  const register = async () => {

    // Password check
    if (!Object.values(valid).every(Boolean)) {
      alert("Password not strong!");
      return;
    }

    // ✅ Role & Job check
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

    if (res.status === 201) {
      setPage("login");
    }
  };

  // ===========================
  // 🖥️ UI
  // ===========================
  return (
    <>
      <h2>Register</h2>

      {/* 👤 BASIC INFO */}
      <input name="name" placeholder="Name" onChange={handleChange}/>
      <input name="email" placeholder="Email" onChange={handleChange}/>
      <input type="date" name="dob" onChange={handleChange}/>
      <input type="password" name="password" placeholder="Password" onChange={handleChange}/>

      {/* 🔐 PASSWORD VALIDATION */}
      <div className="password-check">
        <p className={valid.length ? "valid" : "invalid"}>8 Characters</p>
        <p className={valid.upper ? "valid" : "invalid"}>Uppercase</p>
        <p className={valid.lower ? "valid" : "invalid"}>Lowercase</p>
        <p className={valid.number ? "valid" : "invalid"}>Number</p>
        <p className={valid.special ? "valid" : "invalid"}>Special Character</p>
      </div>

      {/* 🧑‍💼 ROLE SELECT */}
      <select name="role" onChange={handleChange}>
        <option value="">Select Role</option>
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
      </select>

      {/* 💼 JOB SELECT */}
      <select name="job" onChange={handleChange}>
        <option value="">Select Job Role</option>

        <optgroup label="Management">
          <option>Project Manager</option>
          <option>Delivery Manager</option>
          <option>Team Lead</option>
          <option>Tech Lead</option>
        </optgroup>

        <optgroup label="Development">
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>Full Stack Developer</option>
          <option>Software Engineer</option>
          <option>Senior Software Engineer</option>
        </optgroup>

        <optgroup label="Mobile">
          <option>Android Developer</option>
          <option>iOS Developer</option>
          <option>Flutter Developer</option>
          <option>React Native Developer</option>
        </optgroup>

        <optgroup label="Testing">
          <option>QA Engineer</option>
          <option>Manual Tester</option>
          <option>Automation Tester</option>
          <option>SDET</option>
        </optgroup>

        <optgroup label="Cloud & DevOps">
          <option>DevOps Engineer</option>
          <option>Cloud Engineer</option>
          <option>AWS Engineer</option>
          <option>Azure Engineer</option>
          <option>SRE</option>
        </optgroup>

        <optgroup label="Data">
          <option>Data Analyst</option>
          <option>Data Scientist</option>
          <option>Data Engineer</option>
          <option>ML Engineer</option>
          <option>AI Engineer</option>
        </optgroup>

        <optgroup label="Design">
          <option>UI Designer</option>
          <option>UX Designer</option>
          <option>Product Designer</option>
        </optgroup>

        <optgroup label="Business">
          <option>Business Analyst</option>
          <option>Product Manager</option>
          <option>Scrum Master</option>
          <option>HR</option>
          <option>Recruiter</option>
        </optgroup>

        <optgroup label="Security">
          <option>Cyber Security Analyst</option>
          <option>Security Engineer</option>
          <option>Ethical Hacker</option>
        </optgroup>

        <optgroup label="Support">
          <option>System Admin</option>
          <option>Network Engineer</option>
          <option>IT Support Engineer</option>
        </optgroup>

      </select>

      {/* 📧 OTP */}
      <button onClick={sendOtp}>Send OTP</button>

      <input name="otp" placeholder="Enter OTP" onChange={handleChange}/>

      {/* 🚀 REGISTER */}
      <button onClick={register}>Register</button>

      <p onClick={()=>setPage("login")}>
        Already have account? Login
      </p>
    </>
  );
}

export default Register;