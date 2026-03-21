import { useState } from "react";

const API = "http://localhost:5000";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    let res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });

    let data = await res.json();
    alert(data.message);
  };

  return (
    <>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />

      <button onClick={login}>Login</button>

      <p onClick={()=>setPage("forgot")}>Forgot Password?</p>
      <p onClick={()=>setPage("register")}>Create Account</p>
    </>
  );
}

export default Login;