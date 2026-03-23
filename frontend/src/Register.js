import { useState } from "react";

const API = "http://localhost:5000";

function Register({ setPage }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    otp: ""
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
      alert("Password not strong!");
      return;
    }

    let res = await fetch(`${API}/register-verify`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(form)
    });

    alert((await res.json()).message);
    setPage("login");
  };

  return (
    <>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange}/>
      <input name="email" placeholder="Email" onChange={handleChange}/>
      <input type="date" name="dob" onChange={handleChange}/>
      <input type="password" name="password" placeholder="Password" onChange={handleChange}/>

      {/* ✅ LIVE VALIDATION UI */}
      <div className="password-check">
        <p className={valid.length ? "valid" : "invalid"}>8 Characters</p>
        <p className={valid.upper ? "valid" : "invalid"}>Uppercase</p>
        <p className={valid.lower ? "valid" : "invalid"}>Lowercase</p>
        <p className={valid.number ? "valid" : "invalid"}>Number</p>
        <p className={valid.special ? "valid" : "invalid"}>Special Character</p>
      </div>

      <button onClick={sendOtp}>Send OTP</button>

      <input name="otp" placeholder="Enter OTP" onChange={handleChange}/>
      <button onClick={register}>Register</button>

      <p onClick={()=>setPage("login")}>Already have account? Login</p>
    </>
  );
}

export default Register;