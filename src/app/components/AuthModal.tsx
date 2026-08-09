import { useState } from "react";
import API from "../../api";
import { useAppContext } from "../../context/AppContext";
import { X, Package, Eye, EyeOff } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, fetchUser } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const submit = async () => {
    if (!form.email || !form.password) return alert("Please fill all required fields");
    try {
      setLoading(true);
      const url = isLogin ? "/api/login" : "/api/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, phone: form.phone };
      const res = await API.post(url, payload);
      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        await fetchUser();
        setAuthModalOpen(false);
      } else {
        alert("Account created! Please sign in.");
        setIsLogin(true);
        setForm({ ...form, password: "" });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md">
        {/* Close */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-[#0e1420] border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-[#0e1420] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8 relative z-10">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              sn<span className="text-orange-500">dropshipping</span>
            </span>
          </div>

          <p className="text-slate-400 text-sm text-center mb-6 relative z-10">
            {isLogin ? "Welcome back! Sign in to continue." : "Create your free account today."}
          </p>

          {/* Toggle */}
          <div className="flex bg-black/30 rounded-xl p-1 mb-6 border border-white/5 relative z-10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isLogin ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-500 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isLogin ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-500 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            {!isLogin && (
              <div>
                <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  className="w-full bg-black/30 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Phone (optional)</label>
                <input
                  className="w-full bg-black/30 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Email</label>
              <input
                className="w-full bg-black/30 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                placeholder="you@email.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-black/30 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="relative z-10 w-full mt-6 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : isLogin ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
