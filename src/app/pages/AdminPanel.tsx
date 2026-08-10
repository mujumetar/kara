import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Image,
  Mail, Coins, LogOut, Menu, X, Search, Plus, Pencil, Trash2,
  ChevronDown, ChevronUp, TrendingUp, DollarSign, Clock,
  CheckCircle2, Truck, Star, AlertTriangle, Download, Eye,
  RefreshCw, Settings, Zap, BarChart3, ArrowUpRight, FileText,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Stats { totalUsers: number; totalOrders: number; totalRevenue: number; pendingOrders: number; }
interface Order { _id: string; userId: any; products: any[]; address: any; paymentId: string; totalAmount: number; status: string; createdAt: string; }
interface Product { _id: string; title: string; price: number; wholesalePrice?: number; images: string[]; category: string; subcategory: string; stock: number; description: string; avgRating?: number; sizes?: string[]; colors?: string[]; baseOrderCount?: number; }
interface Category { _id: string; name: string; subcategories: string[]; }
interface User { _id: string; name: string; email: string; phone: string; role: string; isBanned: boolean; supercoins: number; createdAt: string; }
interface Slide { _id: string; title: string; image: string; link: string; }
interface EmailTemplate { _id: string; name: string; key: string; subject: string; html: string; isActive: boolean; type: string; }

const CLOUDINARY_NAME = "dlzy4t3i3";
const CLOUDINARY_PRESET = "xyz_abc";

const uploadImage = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  fd.append("folder", "products");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  return data.secure_url;
};

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  Pending:    { text: "text-amber-400",  bg: "bg-amber-400/10"  },
  Processing: { text: "text-blue-400",   bg: "bg-blue-400/10"   },
  Confirmed:  { text: "text-purple-400", bg: "bg-purple-400/10" },
  Shipped:    { text: "text-cyan-400",   bg: "bg-cyan-400/10"   },
  Delivered:  { text: "text-emerald-400",bg: "bg-emerald-400/10"},
};

// ── Invoice Generator ────────────────────────────────────────────────────────
function generateInvoiceHTML(order: Order): string {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const rows = order.products.map((p: any) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">${p.title}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">${p.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">₹${Number(p.price).toFixed(2)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">₹${(p.price * p.quantity).toFixed(2)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Invoice #${order._id.slice(-8).toUpperCase()}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:700px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:40px;color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">sndropshipping</h1>
          <p style="margin:6px 0 0;opacity:0.85;font-size:14px;">Unit 4, Industrial Commerce Park, Manchester, M17 1DL</p>
        </div>
        <div style="text-align:right;">
          <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:8px 16px;">
            <p style="margin:0;font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">Invoice</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:700;">#${order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Meta -->
    <div style="padding:32px 40px;background:#fafafa;display:flex;justify-content:space-between;border-bottom:1px solid #f1f5f9;">
      <div>
        <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Bill To</p>
        <p style="margin:8px 0 0;font-weight:700;color:#1e293b;font-size:16px;">${order.address?.fullName || order.userId?.name || "Customer"}</p>
        <p style="margin:4px 0 0;color:#64748b;font-size:14px;">${order.address?.addressLine || ""}</p>
        <p style="margin:2px 0 0;color:#64748b;font-size:14px;">${order.address?.city || ""} ${order.address?.pincode || ""}</p>
        <p style="margin:2px 0 0;color:#64748b;font-size:14px;">${order.address?.country || "India"}</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Details</p>
        <p style="margin:8px 0 0;color:#64748b;font-size:14px;"><strong style="color:#1e293b;">Date:</strong> ${date}</p>
        <p style="margin:4px 0 0;color:#64748b;font-size:14px;"><strong style="color:#1e293b;">Status:</strong> ${order.status}</p>
        ${order.paymentId ? `<p style="margin:4px 0 0;color:#64748b;font-size:14px;"><strong style="color:#1e293b;">Payment ID:</strong> ${order.paymentId}</p>` : ""}
      </div>
    </div>
    <!-- Table -->
    <div style="padding:0 40px;">
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:14px 16px;text-align:left;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Product</th>
            <th style="padding:14px 16px;text-align:center;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
            <th style="padding:14px 16px;text-align:right;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Unit Price</th>
            <th style="padding:14px 16px;text-align:right;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <!-- Totals -->
    <div style="padding:0 40px 40px;">
      <div style="background:#f8fafc;border-radius:12px;padding:24px;max-width:280px;margin-left:auto;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="color:#64748b;font-size:14px;">Subtotal</span>
          <span style="color:#1e293b;font-weight:600;font-size:14px;">₹${order.totalAmount.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="color:#64748b;font-size:14px;">Shipping</span>
          <span style="color:#22c55e;font-weight:600;font-size:14px;">Free</span>
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:4px;display:flex;justify-content:space-between;">
          <span style="color:#1e293b;font-weight:700;font-size:16px;">Total</span>
          <span style="color:#f97316;font-weight:800;font-size:20px;">₹${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:13px;">Thank you for your order! Questions? <a href="mailto:hello@sndropshipping.com" style="color:#f97316;text-decoration:none;">hello@sndropshipping.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

function downloadInvoice(order: Order) {
  const html = generateInvoiceHTML(order);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${order._id.slice(-8).toUpperCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
const MENU = [
  { id: "dashboard",  label: "Dashboard",      Icon: LayoutDashboard },
  { id: "products",   label: "Products",       Icon: Package         },
  { id: "pricing",    label: "DS Pricing",     Icon: DollarSign      },
  { id: "orders",     label: "Orders",         Icon: ShoppingCart    },
  { id: "users",      label: "Users",          Icon: Users           },
  { id: "categories", label: "Categories",     Icon: Tag             },
  { id: "templates",  label: "Email Templates",Icon: Mail            },
  { id: "supercoins", label: "Supercoins",     Icon: Zap             },
  { id: "slider",     label: "Slider",         Icon: Image           },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const active     = location.pathname.split("/").pop() || "dashboard";

  const [collapsed, setCollapsed] = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Data
  const [stats,      setStats]      = useState<Stats>({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const [products,   setProducts]   = useState<Product[]>([]);
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [users,      setUsers]      = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slides,     setSlides]     = useState<Slide[]>([]);
  const [templates,  setTemplates]  = useState<EmailTemplate[]>([]);

  // Searches
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch,   setOrderSearch]   = useState("");
  const [userSearch,    setUserSearch]    = useState("");

  // Pagination
  const PAGE = 10;
  const [pPg, setPPg] = useState(1);
  const [oPg, setOPg] = useState(1);
  const [uPg, setUPg] = useState(1);

  // Product form
  const [pForm, setPForm] = useState({ title: "", price: "", wholesalePrice: "", description: "", stock: "", category: "", subcategory: "", images: [] as File[], sizes: "", colors: "", baseOrderCount: "0" });
  const [editPId, setEditPId] = useState<string | null>(null);
  const [subcats, setSubcats] = useState<string[]>([]);

  // Category form
  const [cForm, setCForm] = useState({ name: "", subcategories: "" });
  const [editCId, setEditCId] = useState<string | null>(null);

  // Slide form
  const [sForm, setSForm] = useState({ title: "", link: "", image: null as File | null });
  const [editSId, setEditSId] = useState<string | null>(null);

  // Template form
  const [tForm, setTForm] = useState({ name: "", key: "", subject: "", html: "", isActive: true, type: "transactional" });
  const [editTId, setEditTId] = useState<string | null>(null);

  // Supercoin
  const [selUser, setSelUser]   = useState<User | null>(null);
  const [coinAmt, setCoinAmt]   = useState("");

  // Expanded order
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Dropship pricing form
  const [dpForm, setDpForm] = useState({ productId: "", margin: "50" });
  const [dpMsg,  setDpMsg]  = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pr, or, ur, cr] = await Promise.all([
        API.get(`/api/products?search=${productSearch}`),
        API.get(`/api/admin/orders?search=${orderSearch}`),
        API.get(`/api/admin/users?search=${userSearch}`),
        API.get("/api/categories"),
      ]);
      setProducts(pr.data);
      setOrders(or.data);
      setUsers(ur.data);
      setCategories(cr.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchStats     = async () => { try { setStats((await API.get("/api/admin/stats")).data); } catch {} };
  const fetchSlides    = async () => { try { setSlides((await API.get("/api/slider")).data); } catch {} };
  const fetchTemplates = async () => { try { setTemplates((await API.get("/api/admin/email-templates")).data); } catch {} };

  useEffect(() => { fetchAll(); fetchStats(); fetchSlides(); fetchTemplates(); }, []);

  // ── Product helpers ────────────────────────────────────────────────────────
  const handleCatChange = async (val: string) => {
    setPForm(f => ({ ...f, category: val, subcategory: "" }));
    setSubcats([]);
    if (val) {
      try { setSubcats((await API.get(`/api/categories/${val}/subcategories`)).data); } catch {}
    }
  };

  const saveProduct = async () => {
    try {
      setLoading(true);
      let imageUrls: string[] = [];
      if (pForm.images.length) {
        imageUrls = (await Promise.all(pForm.images.map(uploadImage))).filter(Boolean);
      }
      const payload: any = {
        title: pForm.title, price: Number(pForm.price),
        wholesalePrice: pForm.wholesalePrice ? Number(pForm.wholesalePrice) : undefined,
        description: pForm.description, stock: Number(pForm.stock),
        category: pForm.category, subcategory: pForm.subcategory,
        sizes: pForm.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: pForm.colors.split(",").map(c => c.trim()).filter(Boolean),
        baseOrderCount: Number(pForm.baseOrderCount) || 0,
        ...(imageUrls.length && { images: imageUrls }),
      };
      if (editPId) { await API.put(`/api/products/${editPId}`, payload); setEditPId(null); }
      else          { await API.post("/api/products", payload); }
      setPForm({ title: "", price: "", wholesalePrice: "", description: "", stock: "", category: "", subcategory: "", images: [], sizes: "", colors: "", baseOrderCount: "0" });
      setSubcats([]);
      fetchAll();
    } catch (e: any) { alert(e.response?.data?.message || "Failed to save product"); }
    finally { setLoading(false); }
  };

  const editProduct = (p: Product) => {
    setEditPId(p._id);
    setPForm({ title: p.title, price: String(p.price), wholesalePrice: String(p.wholesalePrice || ""), description: p.description, stock: String(p.stock), category: p.category, subcategory: p.subcategory, images: [], sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", "), baseOrderCount: String(p.baseOrderCount || 0) });
    handleCatChange(p.category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await API.delete(`/api/products/${id}`);
    fetchAll();
  };

  const addAdminReview = async (productId: string, comment: string) => {
    try {
      await API.post(`/api/products/${productId}/admin-review`, { comment });
      alert("Admin review added successfully!");
      fetchAll();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to add admin review");
    }
  };

  // ── Dropship pricing ───────────────────────────────────────────────────────
  const applyMarginToAll = async () => {
    const margin = Number(dpForm.margin) / 100;
    if (isNaN(margin) || margin <= 0) return alert("Enter a valid margin %");
    setLoading(true);
    try {
      const targets = dpForm.productId ? products.filter(p => p._id === dpForm.productId) : products;
      await Promise.all(targets.map(p =>
        API.put(`/api/products/${p._id}`, { wholesalePrice: Number((p.price / (1 + margin)).toFixed(2)) })
      ));
      setDpMsg(`Wholesale prices updated for ${targets.length} product(s) using ${dpForm.margin}% margin.`);
      fetchAll();
    } catch { alert("Failed to update prices"); }
    setLoading(false);
  };

  // ── Category helpers ───────────────────────────────────────────────────────
  const saveCategory = async () => {
    const subcategories = cForm.subcategories.split(",").map(s => s.trim()).filter(Boolean);
    try {
      if (editCId) { await API.put(`/api/categories/${editCId}`, { name: cForm.name, subcategories }); setEditCId(null); }
      else          { await API.post("/api/categories", { name: cForm.name, subcategories }); }
      setCForm({ name: "", subcategories: "" });
      fetchAll();
    } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  // ── Slide helpers ──────────────────────────────────────────────────────────
  const saveSlide = async () => {
    const fd = new FormData();
    if (sForm.title) fd.append("title", sForm.title);
    if (sForm.link)  fd.append("link",  sForm.link);
    if (sForm.image) fd.append("image", sForm.image);
    try {
      if (editSId) { await API.put(`/api/slider/${editSId}`, fd); setEditSId(null); }
      else          { await API.post("/api/slider", fd); }
      setSForm({ title: "", link: "", image: null });
      fetchSlides();
    } catch { alert("Failed to save slide"); }
  };

  // ── Template helpers ───────────────────────────────────────────────────────
  const saveTemplate = async () => {
    try {
      if (editTId) { await API.put(`/api/admin/email-templates/${editTId}`, tForm); setEditTId(null); }
      else          { await API.post("/api/admin/email-templates", tForm); }
      setTForm({ name: "", key: "", subject: "", html: "", isActive: true, type: "transactional" });
      fetchTemplates();
      alert("Template saved!");
    } catch (e: any) { alert(e.response?.data?.message || "Failed to save template"); }
  };

  const sendBulkMarketing = async (t: EmailTemplate) => {
    if (!confirm(`Send "${t.name}" to ALL active users?`)) return;
    try {
      const res = await API.post("/api/admin/email/marketing-bulk", { templateKey: t.key });
      alert(`Sent to ${res.data.sent} users!`);
    } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  // ── Order helpers ──────────────────────────────────────────────────────────
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await API.patch(`/api/admin/orders/${id}/status`, { status });
      fetchAll();
    } catch { alert("Failed to update status"); }
  };

  // ── Supercoin helpers ──────────────────────────────────────────────────────
  const updateCoins = async (action: "add" | "deduct") => {
    if (!selUser || !coinAmt || isNaN(Number(coinAmt))) return alert("Select user and enter valid amount");
    try {
      const res = await API.patch(`/api/admin/users/${selUser._id}/supercoins`, { amount: Number(coinAmt), action });
      alert(`Done! Balance: ${res.data.supercoins}`);
      setSelUser(u => u ? { ...u, supercoins: res.data.supercoins } : u);
      setCoinAmt("");
      fetchAll();
    } catch { alert("Failed"); }
  };

  // ── Ban/Unban ──────────────────────────────────────────────────────────────
  const toggleBan = async (u: User) => {
    if (!confirm(`${u.isBanned ? "Unban" : "Ban"} ${u.name}?`)) return;
    try { await API.patch(`/api/admin/users/${u._id}/ban`); fetchAll(); } catch { alert("Failed"); }
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const paginate = <T,>(arr: T[], page: number) => arr.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = (arr: any[]) => Math.max(1, Math.ceil(arr.length / PAGE));

  const nav = (id: string) => navigate(`/admin/${id}`);

  return (
    <div className="flex min-h-screen bg-[#06080e]">

      {/* ── Sidebar ── */}
      <aside className={`${collapsed ? "w-[72px]" : "w-64"} transition-all duration-300 flex-shrink-0 bg-[#0a0f1a] border-r border-white/5 flex flex-col sticky top-0 h-screen`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-sm tracking-tight">
                sn<span className="text-orange-500">admin</span>
              </span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className={`${collapsed ? "mx-auto" : ""} p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors`}>
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto space-y-0.5 px-2">
          {MENU.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => nav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === id
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed ? label : ""}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => { localStorage.clear(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
            title={collapsed ? "Logout" : ""}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#06080e]/95 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-extrabold text-xl capitalize">{MENU.find(m => m.id === active)?.label || active}</h1>
            <p className="text-slate-600 text-xs mt-0.5">sndropshipping admin panel</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />}
            <button onClick={() => { fetchAll(); fetchStats(); }} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* ══════════════ DASHBOARD ══════════════ */}
          {active === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Total Revenue", value: `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`, Icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10", trend: "+12%" },
                  { label: "Total Orders",  value: stats.totalOrders || 0,  Icon: ShoppingCart, color: "text-blue-400",  bg: "bg-blue-400/10",   trend: "+8%"  },
                  { label: "Total Users",   value: stats.totalUsers || 0,   Icon: Users,        color: "text-purple-400",bg: "bg-purple-400/10", trend: "+5%"  },
                  { label: "Pending Orders",value: stats.pendingOrders || 0,Icon: Clock,         color: "text-amber-400", bg: "bg-amber-400/10",  trend: ""     },
                ].map(({ label, value, Icon, color, bg, trend }) => (
                  <div key={label} className="bg-[#0e1420] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      {trend && <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">{trend}</span>}
                    </div>
                    <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
                    <p className="text-white text-2xl font-extrabold">{value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white font-bold">Recent Orders</h3>
                  <button onClick={() => nav("orders")} className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      {["Order ID","Customer","Amount","Status","Date"].map(h => (
                        <th key={h} className="text-left text-xs text-slate-600 font-semibold uppercase tracking-wider px-6 py-3">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => {
                        const sc = STATUS_COLORS[o.status] || { text: "text-slate-400", bg: "bg-slate-400/10" };
                        return (
                          <tr key={o._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-3 text-slate-300 text-sm font-mono">#{o._id.slice(-6).toUpperCase()}</td>
                            <td className="px-6 py-3 text-slate-300 text-sm">{o.userId?.name || "—"}</td>
                            <td className="px-6 py-3 text-orange-400 font-bold text-sm">₹{o.totalAmount}</td>
                            <td className="px-6 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.text} ${sc.bg}`}>{o.status}</span></td>
                            <td className="px-6 py-3 text-slate-500 text-sm">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-5">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Products</p>
                  <p className="text-white text-3xl font-extrabold">{products.length}</p>
                  <p className="text-slate-600 text-xs mt-1">Total catalog items</p>
                </div>
                <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-5">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Categories</p>
                  <p className="text-white text-3xl font-extrabold">{categories.length}</p>
                  <p className="text-slate-600 text-xs mt-1">Active categories</p>
                </div>
                <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-5">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Avg Order Value</p>
                  <p className="text-white text-3xl font-extrabold">
                    ₹{orders.length ? Math.round(stats.totalRevenue / orders.length).toLocaleString("en-IN") : 0}
                  </p>
                  <p className="text-slate-600 text-xs mt-1">Per order</p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ PRODUCTS ══════════════ */}
          {active === "products" && (
            <div className="space-y-6">
              {/* Form */}
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  {editPId ? "Edit Product" : "Add Product"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {[
                    { key: "title",          label: "Product Title",    ph: "e.g. Premium Wireless Earbuds" },
                    { key: "price",          label: "Retail Price (₹)", ph: "e.g. 1999"                     },
                    { key: "wholesalePrice", label: "Wholesale Price (₹)", ph: "e.g. 999 (for dropshippers)" },
                    { key: "stock",          label: "Stock Quantity",   ph: "e.g. 100"                      },
                  ].map(({ key, label, ph }) => (
                    <div key={key}>
                      <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        value={(pForm as any)[key]}
                        onChange={e => setPForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={ph}
                        className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={pForm.category}
                      onChange={e => handleCatChange(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Subcategory</label>
                    <select
                      value={pForm.subcategory}
                      onChange={e => setPForm(f => ({ ...f, subcategory: e.target.value }))}
                      disabled={!pForm.category}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 disabled:opacity-40 transition-colors"
                    >
                      <option value="">Select Subcategory</option>
                      {subcats.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                      value={pForm.description}
                      onChange={e => setPForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      placeholder="Product description..."
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Images</label>
                    <label className="flex flex-col items-center justify-center h-[88px] border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-xl cursor-pointer bg-black/20 transition-colors">
                      <Image className="w-5 h-5 text-slate-600 mb-1" />
                      <span className="text-slate-500 text-xs">{pForm.images.length ? `${pForm.images.length} file(s) selected` : "Click to upload images"}</span>
                      <input type="file" multiple accept="image/*" className="hidden"
                        onChange={e => setPForm(f => ({ ...f, images: Array.from(e.target.files || []) }))} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Sizes (Comma separated)</label>
                    <input
                      value={pForm.sizes}
                      onChange={e => setPForm(f => ({ ...f, sizes: e.target.value }))}
                      placeholder="e.g. S, M, L, XL"
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Colors (Comma separated)</label>
                    <input
                      value={pForm.colors}
                      onChange={e => setPForm(f => ({ ...f, colors: e.target.value }))}
                      placeholder="e.g. Red, Blue, Black"
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Base Order Count</label>
                    <input
                      value={pForm.baseOrderCount}
                      onChange={e => setPForm(f => ({ ...f, baseOrderCount: e.target.value }))}
                      type="number"
                      placeholder="e.g. 2000"
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={saveProduct} disabled={loading} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                    {editPId ? "Update Product" : "Add Product"}
                  </button>
                  {editPId && (
                    <button onClick={() => { setEditPId(null); setPForm({ title: "", price: "", wholesalePrice: "", description: "", stock: "", category: "", subcategory: "", images: [], sizes: "", colors: "", baseOrderCount: "0" }); }}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold rounded-xl text-sm transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Search + Table */}
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAll()}
                      placeholder="Search products..."
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                  <span className="text-slate-600 text-sm">{products.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      {["","Title","Category","Price","Wholesale","Stock","Rating","Actions"].map(h => (
                        <th key={h} className="text-left text-xs text-slate-600 font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {paginate(products, pPg).map(p => (
                        <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0a0f1a] flex-shrink-0">
                              <img src={p.images?.[0] || ""} alt="" className="w-full h-full object-cover" onError={e => { (e.target as any).style.display = "none"; }} />
                            </div>
                          </td>
                          <td className="px-5 py-3 text-white text-sm font-medium max-w-[180px] truncate">{p.title}</td>
                          <td className="px-5 py-3 text-slate-400 text-sm">{p.category}{p.subcategory && ` / ${p.subcategory}`}</td>
                          <td className="px-5 py-3 text-orange-400 font-bold text-sm">₹{p.price}</td>
                          <td className="px-5 py-3 text-blue-400 text-sm">{p.wholesalePrice ? `₹${p.wholesalePrice}` : <span className="text-slate-700">—</span>}</td>
                          <td className="px-5 py-3 text-slate-400 text-sm">{p.stock}</td>
                          <td className="px-5 py-3">
                            {p.avgRating ? (
                              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />{p.avgRating.toFixed(1)}
                              </span>
                            ) : <span className="text-slate-700 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => editProduct(p)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { const review = prompt("Enter admin review for this product:"); if (review) addAdminReview(p._id, review); }} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Add Admin Review"><Star className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteProduct(p._id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-slate-600 text-xs">Page {pPg} of {totalPages(products)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPPg(p => Math.max(1, p - 1))} disabled={pPg === 1} className="px-3 py-1.5 text-xs text-slate-400 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors">Prev</button>
                    <button onClick={() => setPPg(p => Math.min(totalPages(products), p + 1))} disabled={pPg >= totalPages(products)} className="px-3 py-1.5 text-xs text-slate-400 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ DROPSHIP PRICING ══════════════ */}
          {active === "pricing" && (
            <div className="space-y-6">
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Dropship Wholesale Pricing</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Set wholesale prices that dropshippers see. Retail price stays unchanged.</p>
                  </div>
                </div>
              </div>

              {/* Bulk margin setter */}
              <div className="bg-[#0e1420] border border-blue-500/20 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" /> Bulk Margin Tool
                </h4>
                <p className="text-slate-500 text-xs mb-5">
                  Set a margin % to auto-calculate wholesale price: <span className="text-blue-400 font-semibold">Wholesale = Retail ÷ (1 + margin%)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Margin %</label>
                    <input type="number" value={dpForm.margin} onChange={e => setDpForm(f => ({ ...f, margin: e.target.value }))}
                      placeholder="e.g. 60"
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
                    <p className="text-slate-600 text-xs mt-1">Dropshipper earns this % above their cost</p>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Apply To (optional)</label>
                    <select value={dpForm.productId} onChange={e => setDpForm(f => ({ ...f, productId: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors">
                      <option value="">All Products</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={applyMarginToAll} disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                      <Settings className="w-4 h-4" /> Apply Pricing
                    </button>
                  </div>
                </div>
                {dpMsg && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {dpMsg}
                  </div>
                )}
              </div>

              {/* Pricing table */}
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h4 className="text-white font-bold">Current Pricing Overview</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Products with wholesale prices set are visible to dropshippers</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      {["Product","Category","Retail Price","Wholesale Price","Margin","Coverage"].map(h => (
                        <th key={h} className="text-left text-xs text-slate-600 font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {products.map(p => {
                        const margin = p.wholesalePrice ? Math.round(((p.price - p.wholesalePrice) / p.wholesalePrice) * 100) : null;
                        return (
                          <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3 text-white text-sm font-medium max-w-[200px] truncate">{p.title}</td>
                            <td className="px-5 py-3 text-slate-400 text-sm">{p.category}</td>
                            <td className="px-5 py-3 text-orange-400 font-bold text-sm">₹{p.price}</td>
                            <td className="px-5 py-3">
                              {p.wholesalePrice
                                ? <span className="text-blue-400 font-bold text-sm">₹{p.wholesalePrice}</span>
                                : <span className="text-slate-700 text-sm">Not set</span>}
                            </td>
                            <td className="px-5 py-3">
                              {margin !== null
                                ? <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">+{margin}%</span>
                                : <span className="text-slate-700 text-xs">—</span>}
                            </td>
                            <td className="px-5 py-3">
                              <div className={`w-2 h-2 rounded-full inline-block ${p.wholesalePrice ? "bg-emerald-400" : "bg-slate-700"}`} />
                              <span className={`text-xs ml-2 ${p.wholesalePrice ? "text-emerald-400" : "text-slate-600"}`}>
                                {p.wholesalePrice ? "Active" : "Not listed"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-white/5 bg-black/20">
                  <div className="flex gap-6 text-sm">
                    <span className="text-emerald-400 font-semibold">{products.filter(p => p.wholesalePrice).length} products with wholesale pricing</span>
                    <span className="text-slate-600">{products.filter(p => !p.wholesalePrice).length} not yet listed for dropship</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ ORDERS ══════════════ */}
          {active === "orders" && (
            <div className="space-y-5">
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAll()}
                      placeholder="Search by user ID..."
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                  <span className="text-slate-600 text-sm">{orders.length} total</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      {["Order ID","Customer","Products","Amount","Status","Date","Actions"].map(h => (
                        <th key={h} className="text-left text-xs text-slate-600 font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {paginate(orders, oPg).map(o => {
                        const sc = STATUS_COLORS[o.status] || { text: "text-slate-400", bg: "bg-slate-400/10" };
                        const isExp = expandedOrder === o._id;
                        return (
                          <>
                            <tr key={o._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3 text-slate-300 text-sm font-mono">#{o._id.slice(-6).toUpperCase()}</td>
                              <td className="px-5 py-3">
                                <p className="text-white text-sm font-medium">{o.userId?.name || "—"}</p>
                                <p className="text-slate-600 text-xs">{o.userId?.email || ""}</p>
                              </td>
                              <td className="px-5 py-3 text-slate-400 text-sm">{o.products?.length || 0} item(s)</td>
                              <td className="px-5 py-3 text-orange-400 font-bold text-sm">₹{o.totalAmount}</td>
                              <td className="px-5 py-3">
                                <select
                                  value={o.status}
                                  onChange={e => updateOrderStatus(o._id, e.target.value)}
                                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none ${sc.text} ${sc.bg}`}
                                >
                                  {["Pending","Processing","Confirmed","Shipped","Delivered"].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-5 py-3 text-slate-500 text-sm">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => setExpandedOrder(isExp ? null : o._id)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button onClick={() => downloadInvoice(o)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Download Invoice">
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={async () => { if (confirm("Delete this order?")) { await API.delete(`/api/admin/orders/${o._id}`); fetchAll(); } }}
                                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExp && (
                              <tr key={`${o._id}-exp`} className="bg-black/20">
                                <td colSpan={7} className="px-5 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#0e1420] rounded-xl p-4">
                                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Order Items</p>
                                      <div className="space-y-2">
                                        {o.products?.map((p: any, i: number) => (
                                          <div key={i} className="flex justify-between items-center">
                                            <span className="text-slate-300 text-sm">{p.title}</span>
                                            <span className="text-slate-500 text-xs">x{p.quantity} — <span className="text-orange-400 font-bold">₹{(p.price * p.quantity).toFixed(2)}</span></span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="bg-[#0e1420] rounded-xl p-4">
                                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Shipping Address</p>
                                      {o.address ? (
                                        <div className="space-y-1 text-slate-300 text-sm">
                                          <p className="font-bold text-white">{o.address.fullName}</p>
                                          <p>{o.address.addressLine}</p>
                                          <p>{o.address.city}, {o.address.pincode}</p>
                                          <p>{o.address.country}</p>
                                        </div>
                                      ) : <p className="text-slate-600 text-sm">No address</p>}
                                      {o.paymentId && (
                                        <p className="text-slate-600 text-xs mt-3">Payment: <span className="text-emerald-400 font-mono">{o.paymentId}</span></p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-slate-600 text-xs">Page {oPg} of {totalPages(orders)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setOPg(p => Math.max(1, p - 1))} disabled={oPg === 1} className="px-3 py-1.5 text-xs text-slate-400 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors">Prev</button>
                    <button onClick={() => setOPg(p => Math.min(totalPages(orders), p + 1))} disabled={oPg >= totalPages(orders)} className="px-3 py-1.5 text-xs text-slate-400 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ USERS ══════════════ */}
          {active === "users" && (
            <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAll()}
                    placeholder="Search users..."
                    className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                </div>
                <span className="text-slate-600 text-sm">{users.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-white/5">
                    {["Name","Email","Phone","Role","Supercoins","Joined","Status","Actions"].map(h => (
                      <th key={h} className="text-left text-xs text-slate-600 font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {paginate(users, uPg).map(u => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-white text-sm font-medium">{u.name}</td>
                        <td className="px-5 py-3 text-slate-400 text-sm">{u.email}</td>
                        <td className="px-5 py-3 text-slate-400 text-sm">{u.phone || "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.role === "admin" ? "text-purple-400 bg-purple-400/10" : "text-slate-400 bg-white/5"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3" />{u.supercoins || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-sm">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.isBanned ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
                            {u.isBanned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggleBan(u)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isBanned ? "text-emerald-400 hover:bg-emerald-400/10" : "text-red-400 hover:bg-red-400/10"}`}>
                            {u.isBanned ? "Unban" : "Ban"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-slate-600 text-xs">Page {uPg} of {totalPages(users)}</span>
                <div className="flex gap-2">
                  <button onClick={() => setUPg(p => Math.max(1, p - 1))} disabled={uPg === 1} className="px-3 py-1.5 text-xs text-slate-400 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors">Prev</button>
                  <button onClick={() => setUPg(p => Math.min(totalPages(users), p + 1))} disabled={uPg >= totalPages(users)} className="px-3 py-1.5 text-xs text-slate-400 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-40 transition-colors">Next</button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ CATEGORIES ══════════════ */}
          {active === "categories" && (
            <div className="space-y-6">
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  {editCId ? "Edit Category" : "Add Category"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Name</label>
                    <input value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics"
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Subcategories (comma separated)</label>
                    <input value={cForm.subcategories} onChange={e => setCForm(f => ({ ...f, subcategories: e.target.value }))} placeholder="e.g. Phones, Laptops, Tablets"
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={saveCategory} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
                    <Plus className="w-4 h-4" />{editCId ? "Update" : "Add Category"}
                  </button>
                  {editCId && (
                    <button onClick={() => { setEditCId(null); setCForm({ name: "", subcategories: "" }); }}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold rounded-xl text-sm transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c._id} className="bg-[#0e1420] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-bold">{c.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditCId(c._id); setCForm({ name: c.name, subcategories: c.subcategories.join(", ") }); }}
                          className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={async () => { if (confirm("Delete?")) { await API.delete(`/api/categories/${c._id}`); fetchAll(); } }}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.subcategories.map(s => (
                        <span key={s} className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg">{s}</span>
                      ))}
                      {c.subcategories.length === 0 && <span className="text-slate-700 text-xs">No subcategories</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ EMAIL TEMPLATES ══════════════ */}
          {active === "templates" && (
            <div className="space-y-6">
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  {editTId ? "Edit Template" : "New Template"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {[
                    { key: "name",    label: "Template Name",    ph: "e.g. Order Confirmation Email" },
                    { key: "subject", label: "Email Subject",     ph: "e.g. Your order has been confirmed!" },
                  ].map(({ key, label, ph }) => (
                    <div key={key}>
                      <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
                      <input value={(tForm as any)[key]} onChange={e => setTForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                        className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Template Key</label>
                    <select value={tForm.key} onChange={e => setTForm(f => ({ ...f, key: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors">
                      <option value="">Select Key</option>
                      {["orderConfirmed","orderShipped","orderDelivered","paymentReminder","promo","cartAbandoned","welcomeuser","accountBanned","accountUnbanned"].map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Type</label>
                    <select value={tForm.type} onChange={e => setTForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors">
                      <option value="transactional">Transactional (auto-sent)</option>
                      <option value="marketing">Marketing (manual bulk)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={tForm.isActive} onChange={e => setTForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                      <span className="text-slate-400 text-sm">Active</span>
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">HTML Body (use {"{{name}}"}, {"{{orderId}}"} etc.)</label>
                  <textarea value={tForm.html} onChange={e => setTForm(f => ({ ...f, html: e.target.value }))} rows={6} placeholder="<h1>Hello {{name}}</h1>"
                    className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-orange-500/50 transition-colors resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={saveTemplate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
                    <Plus className="w-4 h-4" />{editTId ? "Update" : "Save Template"}
                  </button>
                  {editTId && (
                    <button onClick={() => { setEditTId(null); setTForm({ name: "", key: "", subject: "", html: "", isActive: true, type: "transactional" }); }}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold rounded-xl text-sm transition-colors">Cancel</button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {templates.map(t => (
                  <div key={t._id} className="bg-[#0e1420] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold text-sm">{t.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.type === "marketing" ? "text-purple-400 bg-purple-400/10" : "text-blue-400 bg-blue-400/10"}`}>{t.type}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isActive ? "text-emerald-400 bg-emerald-400/10" : "text-slate-500 bg-white/5"}`}>{t.isActive ? "Active" : "Inactive"}</span>
                        </div>
                        <p className="text-slate-500 text-xs">Key: <span className="text-orange-400 font-mono">{t.key}</span> · Subject: {t.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {t.type === "marketing" && (
                          <button onClick={() => sendBulkMarketing(t)} className="text-xs font-semibold text-purple-400 hover:bg-purple-400/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Send All
                          </button>
                        )}
                        <button onClick={() => { setEditTId(t._id); setTForm({ name: t.name, key: t.key, subject: t.subject, html: t.html, isActive: t.isActive, type: t.type }); }}
                          className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={async () => { if (confirm("Delete?")) { await API.delete(`/api/admin/email-templates/${t._id}`); fetchTemplates(); } }}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && <div className="text-center py-12 text-slate-600">No email templates yet. Create one above.</div>}
              </div>
            </div>
          )}

          {/* ══════════════ SUPERCOINS ══════════════ */}
          {active === "supercoins" && (
            <div className="space-y-6">
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Manage Supercoins
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Select User</label>
                    <select value={selUser?._id || ""} onChange={e => setSelUser(users.find(u => u._id === e.target.value) || null)}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors">
                      <option value="">Choose a user...</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email}) — {u.supercoins} coins</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Amount</label>
                    <input type="number" value={coinAmt} onChange={e => setCoinAmt(e.target.value)} placeholder="e.g. 100"
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                </div>
                {selUser && (
                  <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">{selUser.name}</p>
                      <p className="text-slate-400 text-sm">{selUser.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">Current Balance</p>
                      <p className="text-amber-400 font-extrabold text-2xl flex items-center gap-1"><Zap className="w-5 h-5" />{selUser.supercoins}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => updateCoins("add")} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
                    <Plus className="w-4 h-4" /> Add Coins
                  </button>
                  <button onClick={() => updateCoins("deduct")} className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
                    <Trash2 className="w-4 h-4" /> Deduct Coins
                  </button>
                </div>
              </div>

              <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h4 className="text-white font-bold">Supercoin Leaderboard</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      {["User","Email","Supercoins","Role"].map(h => (
                        <th key={h} className="text-left text-xs text-slate-600 font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[...users].sort((a, b) => (b.supercoins || 0) - (a.supercoins || 0)).slice(0, 15).map(u => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 text-white text-sm font-medium">{u.name}</td>
                          <td className="px-5 py-3 text-slate-400 text-sm">{u.email}</td>
                          <td className="px-5 py-3"><span className="text-amber-400 font-bold flex items-center gap-1"><Zap className="w-3 h-3" />{u.supercoins || 0}</span></td>
                          <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === "admin" ? "text-purple-400 bg-purple-400/10" : "text-slate-400 bg-white/5"}`}>{u.role}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ SLIDER ══════════════ */}
          {active === "slider" && (
            <div className="space-y-6">
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  {editSId ? "Edit Slide" : "Add Slide"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Title</label>
                    <input value={sForm.title} onChange={e => setSForm(f => ({ ...f, title: e.target.value }))} placeholder="Slide title"
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Link</label>
                    <input value={sForm.link} onChange={e => setSForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..."
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Image</label>
                    <label className="flex items-center gap-2 border border-dashed border-white/10 hover:border-orange-500/40 rounded-xl px-4 py-2.5 cursor-pointer bg-black/20 transition-colors">
                      <Image className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-500 text-sm">{sForm.image ? sForm.image.name : "Choose image"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => setSForm(f => ({ ...f, image: e.target.files?.[0] || null }))} />
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={saveSlide} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
                    <Plus className="w-4 h-4" />{editSId ? "Update Slide" : "Add Slide"}
                  </button>
                  {editSId && (
                    <button onClick={() => { setEditSId(null); setSForm({ title: "", link: "", image: null }); }}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold rounded-xl text-sm transition-colors">Cancel</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {slides.map(s => (
                  <div key={s._id} className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                    <div className="h-40 bg-[#0a0f1a] overflow-hidden">
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{s.title}</p>
                        {s.link && <p className="text-slate-600 text-xs truncate">{s.link}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditSId(s._id); setSForm({ title: s.title, link: s.link, image: null }); }}
                          className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={async () => { if (confirm("Delete?")) { await API.delete(`/api/slider/${s._id}`); fetchSlides(); } }}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {slides.length === 0 && <div className="col-span-3 text-center py-12 text-slate-600">No slides yet.</div>}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
