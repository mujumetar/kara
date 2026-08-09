import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import API from "../../api";
import {
  User, Package, MapPin, LogOut, Plus, Trash2, ChevronRight,
  Star, CheckCircle2, Clock, Truck, Shield, Zap, Edit3, Save, X,
} from "lucide-react";

interface Order {
  _id: string;
  products: { title: string; price: number; quantity: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  address: any;
  paymentId: string;
}

const STATUS_COLORS: Record<string, { text: string; bg: string; Icon: any }> = {
  Pending:    { text: "text-amber-400",   bg: "bg-amber-400/10",   Icon: Clock        },
  Processing: { text: "text-blue-400",    bg: "bg-blue-400/10",    Icon: Zap          },
  Confirmed:  { text: "text-purple-400",  bg: "bg-purple-400/10",  Icon: CheckCircle2 },
  Shipped:    { text: "text-cyan-400",    bg: "bg-cyan-400/10",    Icon: Truck        },
  Delivered:  { text: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
};

type Tab = "orders" | "addresses" | "profile";

export default function UserProfile() {
  const { user, logout, fetchUser, setAuthModalOpen } = useAppContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Address form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({ fullName: "", addressLine: "", city: "", pincode: "", country: "India" });
  const [savingAddr, setSavingAddr] = useState(false);

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  useEffect(() => {
    if (tab === "orders") fetchOrders();
  }, [tab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await API.get("/api/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch { setOrders([]); }
    setLoadingOrders(false);
  };

  const addAddress = async () => {
    if (!addrForm.fullName || !addrForm.addressLine || !addrForm.city || !addrForm.pincode) {
      alert("Please fill all address fields");
      return;
    }
    setSavingAddr(true);
    try {
      await API.post("/api/addresses", addrForm);
      await fetchUser();
      setAddrForm({ fullName: "", addressLine: "", city: "", pincode: "", country: "India" });
      setShowAddAddr(false);
    } catch { alert("Failed to add address"); }
    setSavingAddr(false);
  };

  const deleteAddress = async (idx: number) => {
    if (!confirm("Remove this address?")) return;
    try {
      await API.delete(`/api/addresses/${idx}`);
      await fetchUser();
    } catch { alert("Failed to remove address"); }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await API.put("/api/profile", profileForm);
      await fetchUser();
      setEditing(false);
    } catch { alert("Failed to update profile"); }
    setSavingProfile(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#06080e] pt-24 flex flex-col items-center justify-center px-4">
        <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-12 text-center max-w-md w-full">
          <User className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Sign in to view profile</h2>
          <p className="text-slate-500 mb-8">Track orders, manage addresses, and more.</p>
          <button onClick={() => setAuthModalOpen(true)}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all text-sm">
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; Icon: any }[] = [
    { id: "orders",    label: "My Orders",   Icon: Package },
    { id: "addresses", label: "Addresses",   Icon: MapPin  },
    { id: "profile",   label: "Profile",     Icon: User    },
  ];

  return (
    <div className="min-h-screen bg-[#06080e] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-orange-400 font-extrabold text-xl">{user.name?.[0]?.toUpperCase() || "U"}</span>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl">{user.name}</h1>
              <p className="text-slate-500 text-sm">{user.email}</p>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 text-purple-400 text-xs font-bold bg-purple-400/10 px-2 py-0.5 rounded-full mt-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <button onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold px-4 py-2.5 rounded-xl text-sm transition-all border border-purple-500/20">
                <Shield className="w-4 h-4" /> Admin Panel
              </button>
            )}
            <button onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-2 text-slate-500 hover:text-red-400 font-semibold px-4 py-2.5 rounded-xl text-sm bg-white/5 hover:bg-red-400/5 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="space-y-1.5">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === id ? "bg-orange-500/10 text-orange-400" : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}>
                <Icon className="w-4 h-4" />
                {label}
                {tab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}

            {/* Supercoin balance */}
            {(user as any).supercoins > 0 && (
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-bold text-sm">Supercoins</span>
                </div>
                <p className="text-white font-extrabold text-2xl">{(user as any).supercoins}</p>
                <p className="text-slate-600 text-xs mt-0.5">Available balance</p>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-4">

            {/* ── ORDERS ── */}
            {tab === "orders" && (
              <>
                <h2 className="text-white font-extrabold text-lg">Order History</h2>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-[#0e1420] border border-white/5 rounded-2xl p-5 animate-pulse">
                        <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-white font-bold mb-1">No orders yet</p>
                    <p className="text-slate-500 text-sm mb-6">Start shopping to see your orders here.</p>
                    <button onClick={() => navigate("/products")}
                      className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(o => {
                      const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Pending;
                      const StatusIcon = sc.Icon;
                      const isExp = expandedOrder === o._id;
                      return (
                        <div key={o._id} className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                          <button className="w-full p-5 text-left" onClick={() => setExpandedOrder(isExp ? null : o._id)}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-slate-500 text-xs font-mono">#{o._id.slice(-8).toUpperCase()}</span>
                                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${sc.text} ${sc.bg}`}>
                                    <StatusIcon className="w-3 h-3" />{o.status}
                                  </span>
                                </div>
                                <p className="text-slate-400 text-sm">
                                  {o.products?.length || 0} item(s) · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5 truncate">
                                  {o.products?.map(p => p.title).join(", ")}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-orange-400 font-extrabold text-lg">₹{o.totalAmount?.toFixed(2)}</p>
                                <p className="text-slate-600 text-xs mt-0.5">{isExp ? "Hide" : "Details"}</p>
                              </div>
                            </div>
                          </button>

                          {isExp && (
                            <div className="border-t border-white/5 p-5 space-y-4">
                              <div className="bg-black/20 rounded-xl p-4">
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Items</p>
                                <div className="space-y-2">
                                  {o.products?.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                      <span className="text-slate-300">{p.title}</span>
                                      <span className="text-slate-500">x{p.quantity} <span className="text-orange-400 font-bold">₹{(p.price * p.quantity).toFixed(2)}</span></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {o.address && (
                                <div className="bg-black/20 rounded-xl p-4">
                                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Delivered To</p>
                                  <p className="text-white text-sm font-bold">{o.address.fullName}</p>
                                  <p className="text-slate-400 text-sm">{o.address.addressLine}, {o.address.city} {o.address.pincode}</p>
                                </div>
                              )}
                              {o.paymentId && (
                                <p className="text-slate-600 text-xs">Payment: <span className="text-emerald-400 font-mono">{o.paymentId}</span></p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── ADDRESSES ── */}
            {tab === "addresses" && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-white font-extrabold text-lg">Saved Addresses</h2>
                  <button onClick={() => setShowAddAddr(!showAddAddr)}
                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors">
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                </div>

                {showAddAddr && (
                  <div className="bg-[#0e1420] border border-orange-500/20 rounded-2xl p-5 space-y-3 mb-4">
                    <h3 className="text-white font-bold text-sm">New Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "fullName",    label: "Full Name",  ph: "John Doe"         },
                        { key: "addressLine", label: "Address",    ph: "123 Main St"       },
                        { key: "city",        label: "City",       ph: "Mumbai"            },
                        { key: "pincode",     label: "Pincode",    ph: "400001"            },
                        { key: "country",     label: "Country",    ph: "India"             },
                      ].map(({ key, label, ph }) => (
                        <div key={key}>
                          <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</label>
                          <input value={(addrForm as any)[key]} onChange={e => setAddrForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={ph}
                            className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={addAddress} disabled={savingAddr}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                        <Save className="w-4 h-4" /> Save Address
                      </button>
                      <button onClick={() => setShowAddAddr(false)}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold rounded-xl text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {user.addresses?.length === 0 ? (
                  <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-10 text-center">
                    <MapPin className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-white font-bold mb-1">No saved addresses</p>
                    <p className="text-slate-500 text-sm">Add an address to speed up checkout.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.addresses?.map((addr: any, idx: number) => (
                      <div key={idx} className="bg-[#0e1420] border border-white/5 rounded-2xl p-5 flex items-start justify-between hover:border-white/10 transition-colors">
                        <div>
                          <p className="text-white font-bold text-sm">{addr.fullName}</p>
                          <p className="text-slate-400 text-sm mt-0.5">{addr.addressLine}</p>
                          <p className="text-slate-500 text-sm">{addr.city}, {addr.pincode}</p>
                          <p className="text-slate-600 text-sm">{addr.country}</p>
                        </div>
                        <button onClick={() => deleteAddress(idx)}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── PROFILE ── */}
            {tab === "profile" && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-white font-extrabold text-lg">Profile Details</h2>
                  {!editing ? (
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors">
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <button onClick={() => setEditing(false)}
                      className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-semibold transition-colors">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>

                <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6 space-y-5">
                  {editing ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Full Name</label>
                          <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Phone</label>
                          <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
                        </div>
                      </div>
                      <button onClick={saveProfile} disabled={savingProfile}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                        <Save className="w-4 h-4" />
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        { label: "Full Name",  value: user.name                              },
                        { label: "Email",      value: user.email                             },
                        { label: "Phone",      value: user.phone || "Not set"                },
                        { label: "Account",    value: user.role === "admin" ? "Admin" : "Customer" },
                        { label: "Supercoins", value: String((user as any).supercoins || 0)  },
                        { label: "Addresses",  value: String(user.addresses?.length || 0)    },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-white font-semibold text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
