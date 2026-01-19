import { useState } from "react";
import API from "./api";

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      const url = isLogin ? "/api/login" : "/api/register";
      const res = await API.post(url, form);

      if (isLogin) {
        const { token, user } = res.data;

        // Save token in localStorage
        localStorage.setItem("token", token);

        // Set default header for future requests
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(user); // set logged-in user in App
      } else {
        alert("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={box}>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {!isLogin && (
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      )}
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button onClick={submit} disabled={loading}>
        {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
      </button>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
        {isLogin ? "Create account" : "Already have account"}
      </p>
    </div>
  );
}

const box = { width: 300, margin: "100px auto", display: "grid", gap: 10 };
