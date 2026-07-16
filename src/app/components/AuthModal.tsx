import { useState } from "react";
import API from "../../api";
import { useAppContext } from "../../context/AppContext";
import { X } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, fetchUser } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const submit = async () => {
    try {
      setLoading(true);
      const url = isLogin ? "/api/login" : "/api/register";
      const res = await API.post(url, form);
      if (isLogin) {
        const { token } = res.data;
        localStorage.setItem("token", token);
        // Update user context and close modal
        await fetchUser();
        setAuthModalOpen(false);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute -top-4 -right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-[#06080e]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Background orbs inside modal */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#00e5ff]/20 rounded-full blur-[80px] -z-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] -z-10" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Kara<span className="text-[#00e5ff]">Store</span>
            </h1>
            <p className="text-white/60">
              {isLogin ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          <div className="flex bg-black/40 rounded-xl p-1 mb-6 border border-white/5 relative z-10">
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

          <div className="space-y-4 relative z-10">
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
            className="relative z-10 w-full mt-8 py-3.5 bg-[#00e5ff] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </div>
      </div>
    </div>
  );
}
