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

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
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

      <button onClick={sendOtp}>Send OTP</button>
      <input name="otp" placeholder="Enter OTP" onChange={handleChange}/>
      <button onClick={register}>Register</button>

      <p onClick={()=>setPage("login")}>Already have account? Login</p>
    </>
  );
}

export default Register;