import { useState } from "react";
import API from "./api";
import full_logo from "./assets/img/kara_logo.jpeg";

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
        localStorage.setItem("token", token);
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(user);
      } else {
        alert("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && submit();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mb-3 ring-2 ring-white/30">
              <img src={full_logo} alt="Kara" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Kara<span className="text-purple-400">Store</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {isLogin ? "Welcome back! Sign in to continue" : "Create your account today"}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isLogin ? "bg-white text-purple-700 shadow-md" : "text-white/70 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isLogin ? "bg-white text-purple-700 shadow-md" : "text-white/70 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={handleKey}
                />
              </div>
            )}
            <div>
              <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">Email</label>
              <input
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder="you@email.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
            <div>
              <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">Password</label>
              <input
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all duration-300 text-sm tracking-wide"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : isLogin ? "Sign In" : "Create Account"}
          </button>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} KaraStore. All rights reserved.
        </p>
      </div>
    </div>
  );
}
