import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      return toast.error("Username and password required");
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.error) return toast.error(data.error);

      localStorage.setItem("user", JSON.stringify({ username: data.username }));
      localStorage.setItem("token", data.token);

      toast.success("Login successful!");
      onLogin({ username: data.username, token: data.token });
      navigate("/myrecipes");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="card p-4 shadow-sm" style={{ maxWidth: 400, margin: "auto" }}>
      <h3>Login</h3>
      <input
        placeholder="Username"
        className="form-control mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        className="form-control mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-primary w-100" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;
