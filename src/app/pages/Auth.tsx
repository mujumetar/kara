import { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    try {
      setLoading(true);
      const url = isLogin ? "/api/login" : "/api/register";
      const res = await API.post(url, form);
      if (isLogin) {
        const { token } = res.data;
        localStorage.setItem("token", token);
        // Force reload to fetch user data in context
        window.location.href = "/";
      } else {
        alert("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => e.key === "Enter" && submit();

  return (
    <div className="min-h-screen pt-24 bg-[#06080e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Kara<span className="text-[#00e5ff]">Store</span>
            </h1>
            <p className="text-white/60">
              {isLogin ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          <div className="flex bg-black/40 rounded-xl p-1 mb-6 border border-white/5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isLogin ? "bg-white/10 text-white shadow-md" : "text-white/50 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isLogin ? "bg-white/10 text-white shadow-md" : "text-white/50 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                <input
                  className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] transition-all"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={handleKey}
                />
              </div>
            )}
            <div>
              <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
              <input
                className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] transition-all"
                placeholder="you@email.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
            <div>
              <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <input
                className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] transition-all"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full mt-8 py-3.5 bg-[#00e5ff] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </div>
      </div>
    </div>
  );
}
