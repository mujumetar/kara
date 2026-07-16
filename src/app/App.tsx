import { useState, useEffect } from "react";
import api from "../api";
import {
  ShoppingCart, Menu, X, ArrowRight, Package, Globe, Zap, Shield,
  Truck, Star, Search, Building2, Users, Award, MapPin, Phone, Mail,
  TrendingUp, DollarSign, CheckCircle2, Heart, BarChart3, RefreshCw,
  ChevronRight,
} from "lucide-react";

type Page = "home" | "products" | "dropship" | "about";
type Mode = "shop" | "dropship";

interface Product {
  id: number;
  name: string;
  price: number;
  wholesale: number;
  category: string;
  rating: number;
  reviews: number;
  imgId: string;
  badge: string | null;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Premium Wireless Earbuds", price: 49.99, wholesale: 18.5, category: "Electronics", rating: 4.8, reviews: 324, imgId: "1590658268037-6bf12165a8df", badge: "Best Seller" },
  { id: 2, name: "Smart Fitness Tracker", price: 79.99, wholesale: 28.0, category: "Electronics", rating: 4.7, reviews: 218, imgId: "1523275335684-37898b6baf30", badge: "New" },
  { id: 3, name: "Minimalist Leather Wallet", price: 34.99, wholesale: 10.2, category: "Accessories", rating: 4.9, reviews: 512, imgId: "1627123424574-724758594785", badge: "Top Rated" },
  { id: 4, name: "Portable Phone Stand", price: 19.99, wholesale: 5.8, category: "Accessories", rating: 4.6, reviews: 189, imgId: "1616763355548-1b606f439f86", badge: null },
  { id: 5, name: "LED Desk Lamp", price: 44.99, wholesale: 16.0, category: "Home & Office", rating: 4.7, reviews: 267, imgId: "1593640408182-31c228745a9b", badge: "Hot" },
  { id: 6, name: "Premium Yoga Mat", price: 59.99, wholesale: 20.5, category: "Sports", rating: 4.8, reviews: 398, imgId: "1574680096145-d05b474e2155", badge: "Best Seller" },
  { id: 7, name: "Stainless Steel Bottle", price: 29.99, wholesale: 9.0, category: "Sports", rating: 4.9, reviews: 601, imgId: "1602143407151-7111542de6e8", badge: "Top Rated" },
  { id: 8, name: "Canvas Tote Bag", price: 24.99, wholesale: 7.5, category: "Accessories", rating: 4.5, reviews: 142, imgId: "1548036328-c9fa89d128fa", badge: null },
];

const CATEGORIES = ["All", "Electronics", "Accessories", "Home & Office", "Sports"];

const HERO_PHRASES = [
  "Sell Without Limits",
  "Source & Ship Globally",
  "Build Your Empire",
  "Drop. Ship. Profit.",
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({
  page, setPage, mode, setMode, cartCount, setAuthModalOpen
}: {
  page: Page;
  setPage: (p: Page) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  cartCount: number;
  setAuthModalOpen: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks: { label: string; page: Page }[] = [
    { label: "Home", page: "home" },
    { label: "Products", page: "products" },
    { label: "Dropship", page: "dropship" },
    { label: "About Us", page: "about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#06080e]/95 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-400 transition-colors">
            <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            sn<span className="text-orange-500">dropshipping</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => setPage(link.page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                page === link.page
                  ? "text-orange-400 bg-orange-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
            <button
              onClick={() => setMode("shop")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "shop" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => setMode("dropship")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "dropship" ? "bg-blue-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Dropship
            </button>
          </div>

          <button onClick={() => setAuthModalOpen(true)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button onClick={() => window.location.href = "/cart"} className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#06080e]/98 backdrop-blur-md border-t border-white/10 px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => { setPage(link.page); setOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                page === link.page ? "text-orange-400 bg-orange-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setMode("shop")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === "shop" ? "bg-orange-500 text-white" : "bg-white/5 text-slate-400"
              }`}
            >
              Shop Mode
            </button>
            <button
              onClick={() => setMode("dropship")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === "dropship" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400"
              }`}
            >
              Dropship Mode
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ setPage, mode }: { setPage: (p: Page) => void; mode: Mode }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIdx((i) => (i + 1) % HERO_PHRASES.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const previewCards = [
    { name: "Wireless Earbuds", price: "₹49.99", wholesale: "₹18.50", margin: 170, imgId: "1590658268037-6bf12165a8df", top: "4%", left: "8%", rotate: "-7deg", zIndex: 1 },
    { name: "Smart Watch", price: "₹79.99", wholesale: "₹28.00", margin: 186, imgId: "1523275335684-37898b6baf30", top: "22%", left: "38%", rotate: "4deg", zIndex: 3 },
    { name: "Leather Wallet", price: "₹34.99", wholesale: "₹10.20", margin: 243, imgId: "1627123424574-724758594785", top: "52%", left: "4%", rotate: "-4deg", zIndex: 2 },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#06080e" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
            top: -150,
            left: -200,
            animation: "orb1 9s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 550,
            height: 550,
            background: "radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)",
            bottom: -150,
            right: -100,
            animation: "orb2 11s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-2xl"
          style={{
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
            top: "45%",
            right: "28%",
            animation: "orb3 7s ease-in-out infinite",
          }}
        />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center w-full">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-4 py-2.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            {mode === "dropship"
              ? "Dropship Mode — Wholesale Prices Visible"
              : "12,000+ Products Ready to Ship Worldwide"}
          </div>

          <div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Welcome to sndropshipping
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold text-white leading-[1.06] tracking-tight">
              Your Complete
              <br />
              <span
                className="text-transparent bg-clip-text block"
                style={{
                  backgroundImage: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  minHeight: "1.15em",
                }}
              >
                {HERO_PHRASES[phraseIdx]}
              </span>
              <span className="text-slate-500 text-3xl sm:text-4xl font-medium block mt-1 leading-tight">Platform</span>
            </h1>
          </div>

          <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
            {mode === "dropship"
              ? "Access 12,000+ products at wholesale prices. List them on your store and we handle storage, packing, and worldwide delivery."
              : "Shop premium products with fast worldwide delivery — or switch to Dropship mode and build your own online business with zero inventory."}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setPage("products")}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-7 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {mode === "dropship" ? "Browse Catalog" : "Shop Now"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage("dropship")}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold px-7 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
            >
              {mode === "dropship" ? "View Pricing" : "Start Dropshipping"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            {[
              { icon: Shield, label: "Secure Payments" },
              { icon: Truck, label: "Worldwide Shipping" },
              { icon: RefreshCw, label: "Easy Returns" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-500 text-sm">
                <Icon className="w-4 h-4 text-orange-500" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:flex justify-center items-center h-[520px]">
          {previewCards.map((card, i) => (
            <div
              key={i}
              className="absolute w-52 bg-[#0e1420] border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:scale-105 hover:border-white/20 transition-all duration-300 cursor-pointer group"
              style={{ top: card.top, left: card.left, transform: `rotate(${card.rotate})`, zIndex: card.zIndex }}
            >
              <div className="h-32 bg-[#0a0f1a] overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-${card.imgId}?w=220&h=160&fit=crop&auto=format`}
                  alt={card.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3.5">
                <p className="text-white text-xs font-bold truncate mb-1">{card.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 text-sm font-extrabold">
                    {mode === "dropship" ? card.wholesale : card.price}
                  </span>
                  {mode === "dropship" && (
                    <span className="text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded-md">
                      +{card.margin}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div
            className="absolute bottom-6 right-2 bg-[#0e1420] border border-white/10 rounded-2xl p-4 shadow-2xl"
            style={{ zIndex: 10 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">3,241 orders</p>
                <p className="text-slate-500 text-xs">shipped today</p>
              </div>
            </div>
          </div>

          <div
            className="absolute top-6 right-0 bg-[#0e1420] border border-white/10 rounded-2xl p-4 shadow-2xl"
            style={{ zIndex: 10 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">47 countries</p>
                <p className="text-slate-500 text-xs">worldwide delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: "12,000+", label: "Products" },
    { value: "47", label: "Countries Served" },
    { value: "8,500+", label: "Active Dropshippers" },
    { value: "3,500+", label: "Daily Orders" },
    { value: "4.9★", label: "Average Rating" },
  ];
  return (
    <div className="bg-[#0e1420] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white text-2xl font-extrabold">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, mode, onAddToCart }: { product: Product; mode: Mode; onAddToCart: () => void }) {
  const [wishlisted, setWishlisted] = useState(false);
  const margin = Math.round(((product.price - product.wholesale) / product.wholesale) * 100);

  return (
    <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col">
      <div className="relative bg-[#0a0f1a] h-52 overflow-hidden flex-shrink-0">
        <img
          src={`https://images.unsplash.com/photo-${product.imgId}?w=400&h=320&fit=crop&auto=format`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {product.badge}
          </span>
        )}
        {mode === "dropship" && (
          <span className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
            +{margin}% margin
          </span>
        )}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute bottom-3 right-3 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? "text-red-400 fill-red-400" : "text-white"}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white text-sm font-semibold leading-snug mb-1.5 flex-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-4">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-amber-400 text-xs font-semibold">{product.rating}</span>
          <span className="text-slate-600 text-xs">({product.reviews} reviews)</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            {mode === "dropship" ? (
              <div>
                <p className="text-slate-600 text-[10px] font-medium uppercase tracking-wider">Wholesale</p>
                <p className="text-blue-400 text-xl font-extrabold leading-none">₹{product.wholesale.toFixed(2)}</p>
                <p className="text-slate-600 text-xs mt-0.5">Retail ₹{product.price.toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-orange-400 text-xl font-extrabold">₹{product.price.toFixed(2)}</p>
            )}
          </div>
          <button
            onClick={onAddToCart}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0 ${
              mode === "dropship"
                ? "bg-blue-500 hover:bg-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/20"
                : "bg-orange-500 hover:bg-orange-400 text-white hover:shadow-lg hover:shadow-orange-500/20"
            }`}
          >
            {mode === "dropship" ? "Add to Catalog" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Section ─────────────────────────────────────────────────────────

function FeaturedSection({ mode, setPage, onAddToCart, products }: { mode: Mode; setPage: (p: Page) => void; onAddToCart: () => void; products: Product[] }) {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <section className="py-20 bg-[#06080e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">
              {mode === "dropship" ? "Wholesale Catalog" : "Featured Products"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {mode === "dropship" ? "High-Margin Products" : "Trending Right Now"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  cat === c
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} mode={mode} onAddToCart={onAddToCart} />
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => setPage("products")}
            className="inline-flex items-center gap-2 border border-white/10 hover:border-orange-500/40 text-white hover:text-orange-400 font-semibold px-8 py-4 rounded-xl transition-all hover:bg-orange-500/5 text-sm"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Dropship Value Section ───────────────────────────────────────────────────

function DropshipSection({ setPage }: { setPage: (p: Page) => void }) {
  const features = [
    { icon: DollarSign, title: "High Margins", desc: "Average 60–200% profit on every product in our catalog.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: Package, title: "Zero Inventory", desc: "We store everything. You sell, we ship directly to your customers.", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Globe, title: "47 Countries", desc: "Reliable worldwide shipping with tracked delivery on every order.", color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: Zap, title: "Instant Sync", desc: "Auto-sync to Shopify, WooCommerce, and 12+ other platforms.", color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: BarChart3, title: "Live Analytics", desc: "Track sales, margins, and shipping from one clean dashboard.", color: "text-rose-400", bg: "bg-rose-400/10" },
    { icon: Shield, title: "Quality Guarantee", desc: "Every product quality-checked before leaving our warehouse.", color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <section className="py-20 bg-[#080b12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-400 text-xs font-bold mb-3 uppercase tracking-widest">For Dropshippers</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Build a business
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                without inventory
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Join 8,500+ entrepreneurs running profitable online stores through sndropshipping.
              No warehouse, no upfront stock, no shipping headaches — just pure margin.
            </p>
            <button
              onClick={() => setPage("dropship")}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-7 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 text-sm"
            >
              Start Dropshipping <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-10 space-y-4">
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">How It Works</p>
              {[
                { n: "01", t: "Browse our catalog and import products to your store" },
                { n: "02", t: "Customer purchases from your store at your retail price" },
                { n: "03", t: "We pick, pack, and ship directly — you keep the margin" },
              ].map((item) => (
                <div key={item.n} className="flex items-center gap-4">
                  <span className="text-orange-500/40 text-sm font-mono font-extrabold w-8 flex-shrink-0">{item.n}</span>
                  <div className="w-8 h-px bg-white/5 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-snug">{item.t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-[#0e1420] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h4 className="text-white text-sm font-bold mb-1">{title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    { name: "Sarah Mitchell", role: "Shopify Store Owner", text: "sndropshipping changed everything for me. I went from zero to 12k a month in 4 months. The product quality and shipping speed are simply unmatched.", avatar: "1494790108377-be9c29b29330", stars: 5 },
    { name: "James Okonkwo", role: "E-commerce Entrepreneur", text: "I run 3 online stores and source everything through sndropshipping. Their catalog is huge and the margins are excellent — over 150% on some product lines.", avatar: "1472099645785-5658abf4ff4e", stars: 5 },
    { name: "Emily Chen", role: "Fashion Boutique Owner", text: "The quality control is outstanding. My customers keep coming back. The warehouse team clearly cares about every single order that goes out.", avatar: "1438761681033-6461ffad8d80", stars: 5 },
  ];

  return (
    <section className="py-20 bg-[#06080e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">Success Stories</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What our community says</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[#0e1420] border border-white/5 rounded-2xl p-7 hover:border-white/10 transition-colors">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={`https://images.unsplash.com/photo-${t.avatar}?w=80&h=80&fit=crop&auto=format`}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover bg-[#0a0f1a]"
                />
                <div>
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section className="py-20 bg-[#080b12]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div
          className="rounded-3xl p-12 sm:p-16 border border-orange-500/15 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(59,130,246,0.08) 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(249,115,22,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-orange-500 text-xs font-bold mb-3 uppercase tracking-widest">Get Started Today</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to build your<br />dropshipping empire?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of entrepreneurs already scaling their businesses with sndropshipping.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setPage("products")}
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 text-sm"
              >
                Browse Products
              </button>
              <button
                onClick={() => setPage("dropship")}
                className="bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
              >
                Become a Dropshipper
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Products Page ────────────────────────────────────────────────────────────

function ProductsPage({ mode, onAddToCart, products }: { mode: Mode; onAddToCart: () => void; products: Product[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  let filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => (mode === "dropship" ? a.wholesale - b.wholesale : a.price - b.price));
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => (mode === "dropship" ? b.wholesale - a.wholesale : b.price - a.price));
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-[#06080e] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">
            {mode === "dropship" ? "Wholesale Catalog" : "All Products"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {mode === "dropship" ? "Dropship Catalog" : "Shop All Products"}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">{products.length} products available</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0e1420] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  category === c ? "bg-orange-500 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0e1420] border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm focus:outline-none focus:border-orange-500/50 cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} mode={mode} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dropship Page ────────────────────────────────────────────────────────────

function DropshipPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      desc: "Perfect to get started",
      features: ["50 products in catalog", "Basic sales analytics", "Standard shipping rates", "Email support"],
      cta: "Get Started Free",
      highlight: false,
    },
    {
      name: "Growth",
      price: "₹29",
      period: "/month",
      desc: "For growing stores",
      features: ["500 products in catalog", "Advanced analytics", "Priority shipping rates", "Live chat support", "Full API access", "Shopify & WooCommerce sync"],
      cta: "Start 14-Day Trial",
      highlight: true,
    },
    {
      name: "Pro",
      price: "₹79",
      period: "/month",
      desc: "For serious sellers",
      features: ["Unlimited products", "Full analytics suite", "Express shipping rates", "Dedicated account manager", "Custom white-label packaging", "Bulk order discounts"],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#06080e] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-blue-400 text-xs font-bold mb-3 uppercase tracking-widest">Dropship Program</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Your dropshipping
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              business starts here
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No minimum orders. No inventory risk. Start selling from our 12,000+ product catalog today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: DollarSign, title: "Average 120% ROI", desc: "Our dropshippers report an average 120% return on investment within their first 6 months.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { icon: Globe, title: "Global Fulfillment", desc: "We ship to 47 countries with fully tracked, insured delivery on every single order.", color: "text-blue-400", bg: "bg-blue-400/10" },
            { icon: Zap, title: "48-Hour Processing", desc: "Orders are picked, packed, and dispatched within 48 hours of your customer buying.", color: "text-amber-400", bg: "bg-amber-400/10" },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-[#0e1420] border border-white/5 rounded-2xl p-8 text-center">
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-2">Simple, transparent pricing</h2>
          <p className="text-slate-500 text-sm">No hidden fees. No contracts. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border transition-all relative ${
                plan.highlight
                  ? "bg-blue-500/8 border-blue-500/30"
                  : "bg-[#0e1420] border-white/5 hover:border-white/10"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                  Most Popular
                </span>
              )}
              <h3 className="text-white text-xl font-extrabold mb-1">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-5">{plan.desc}</p>
              <div className="flex items-baseline gap-0.5 mb-7">
                <span className="text-white text-4xl font-extrabold">{plan.price}</span>
                <span className="text-slate-500 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3.5 rounded-xl font-bold transition-all text-sm ${
                  plan.highlight
                    ? "bg-blue-500 hover:bg-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-8">
          <p className="text-slate-500 text-xs font-bold text-center mb-6 uppercase tracking-widest">
            Integrates with your store
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Shopify", "WooCommerce", "BigCommerce", "Wix", "Squarespace", "Etsy", "Amazon", "eBay"].map((platform) => (
              <span
                key={platform}
                className="text-slate-300 font-bold text-sm bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────

function AboutPage() {
  const team = [
    { name: "David Sharma", role: "Founder & CEO", avatar: "1560250097-0b93528c311a" },
    { name: "Priya Nair", role: "Head of Operations", avatar: "1573496359142-b8d87734a5a2" },
    { name: "Marcus Johnson", role: "Logistics Director", avatar: "1556157382-97eda2f9e2bf" },
    { name: "Anna Kowalski", role: "Head of Technology", avatar: "1580489944761-15a19d654956" },
  ];

  return (
    <div className="min-h-screen bg-[#06080e] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="text-orange-500 text-xs font-bold mb-3 uppercase tracking-widest">Our Story</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              Built by sellers,
              <br />
              <span className="text-orange-500">for sellers</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-4">
              sndropshipping was founded in 2019 by a team of e-commerce entrepreneurs who could not find a
              reliable dropshipping partner. So we built one from scratch.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Starting with a 5,000 sq ft warehouse in Manchester and just 300 products,
              we grew by obsessing over two things: product quality and shipping speed.
              Today we operate from a 45,000 sq ft fulfillment hub and serve over 8,500
              dropshippers across 47 countries.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "2019", label: "Founded" },
                { value: "45k sqft", label: "Warehouse" },
                { value: "8,500+", label: "Partners" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0e1420] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-orange-400 text-xl font-extrabold">{stat.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-[#0a0f1a] aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&auto=format"
                alt="Our warehouse facility"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-[#0e1420] border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">45,000 sq ft</p>
                  <p className="text-slate-500 text-xs">Central Fulfillment Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">Our Facilities</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Where the magic happens</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden">
              <div className="h-52 bg-[#0a0f1a] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=400&fit=crop&auto=format"
                  alt="Warehouse interior operations"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-7">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-white text-xl font-extrabold">SN Central Fulfillment Hub</h3>
                    <p className="text-slate-500 text-sm mt-0.5">Primary warehouse and dispatch centre</p>
                  </div>
                  <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
                    Operational 24/7
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Building2, label: "Floor Area", value: "45,000 sq ft" },
                    { icon: Package, label: "Active SKUs", value: "12,000+" },
                    { icon: Truck, label: "Daily Orders", value: "3,500+" },
                    { icon: Globe, label: "Countries", value: "47" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-[#06080e] border border-white/5 rounded-xl p-3 text-center">
                      <Icon className="w-4 h-4 text-orange-500 mx-auto mb-1.5" />
                      <p className="text-white text-sm font-bold">{value}</p>
                      <p className="text-slate-600 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4">Location and Contact</h4>
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-300 text-sm">Unit 4, Industrial Commerce Park</p>
                      <p className="text-slate-300 text-sm">Manchester, M17 1DL</p>
                      <p className="text-slate-500 text-sm">United Kingdom</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">+44 (0) 161 XXX XXXX</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">warehouse@sndropshipping.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4">Warehouse Capabilities</h4>
                <ul className="space-y-2.5">
                  {[
                    "Climate-controlled storage zones",
                    "Automated picking system",
                    "Custom packaging and branding",
                    "Same-day dispatch by 3pm",
                    "Full returns processing",
                    "Quality inspection on intake",
                  ].map((cap) => (
                    <li key={cap} className="flex items-center gap-2.5 text-slate-400 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What we stand for</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "Quality First", desc: "Every product entering our warehouse is inspected against our 12-point quality checklist before it is ever listed.", color: "text-amber-400", bg: "bg-amber-400/10" },
              { icon: Users, title: "Partner Success", desc: "We succeed when our dropshippers succeed. Our team is fully dedicated to helping you grow your business.", color: "text-blue-400", bg: "bg-blue-400/10" },
              { icon: Shield, title: "Total Transparency", desc: "Real-time inventory, honest margins, and no hidden fees. You always know exactly what you are paying for.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-[#0e1420] border border-white/5 rounded-2xl p-8 text-center">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <h3 className="text-white text-lg font-bold mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <div className="text-center mb-10">
            <p className="text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">The Team</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">The people behind sndropshipping</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {team.map((member) => (
              <div key={member.name} className="bg-[#0e1420] border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors">
                <img
                  src={`https://images.unsplash.com/photo-${member.avatar}?w=200&h=200&fit=crop&auto=format`}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 bg-[#0a0f1a]"
                />
                <p className="text-white text-sm font-bold">{member.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer className="bg-[#080b12] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                sn<span className="text-orange-500">dropshipping</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-5">
              Your complete ecommerce and dropshipping platform. 12,000+ products, 47 countries, zero hassle.
            </p>
            <div className="flex gap-2.5">
              {["T", "I", "L"].map((s) => (
                <button
                  key={s}
                  className="w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-slate-500 hover:text-white text-xs font-bold transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white text-sm font-bold mb-4">Quick Links</p>
            <ul className="space-y-3">
              {(["home", "products", "dropship", "about"] as Page[]).map((p) => (
                <li key={p}>
                  <button
                    onClick={() => setPage(p)}
                    className="text-slate-500 hover:text-white text-sm capitalize transition-colors"
                  >
                    {p === "dropship" ? "Dropship Program" : p === "about" ? "About Us" : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-sm font-bold mb-4">Contact</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-slate-500 text-sm">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                Manchester, M17 1DL, UK
              </li>
              <li className="flex items-center gap-2.5 text-slate-500 text-sm">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                hello@sndropshipping.com
              </li>
              <li className="flex items-center gap-2.5 text-slate-500 text-sm">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                +44 (0) 161 XXX XXXX
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-700 text-xs">© 2024 sndropshipping. All rights reserved.</p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <button key={l} className="text-slate-700 hover:text-slate-400 text-xs transition-colors">
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

import { Routes, Route, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [mode, setMode] = useState<Mode>("shop");
  const { cart, products, fetchProducts, setAuthModalOpen } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // We map the old setPage to navigate for compatibility with existing components
  const handleSetPage = (p: Page) => {
    setPage(p);
    if (p === "home") navigate("/");
    if (p === "products") navigate("/products");
    if (p === "dropship") navigate("/dropship");
    if (p === "about") navigate("/about");
  };

  const handleAddToCart = () => {
    // handled inside context now, but we pass dummy to existing UI if needed
  };

  return (
    <div className="min-h-screen bg-[#06080e]">
      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.06); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.08); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(25px, -35px) scale(0.94); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>

      <Navbar page={page} setPage={handleSetPage} mode={mode} setMode={setMode} cartCount={cartCount} setAuthModalOpen={setAuthModalOpen} />

      <Routes>
        <Route path="/" element={
          <>
            <HeroSection setPage={handleSetPage} mode={mode} />
            <StatsBar />
            <FeaturedSection mode={mode} setPage={handleSetPage} onAddToCart={handleAddToCart} products={products} />
            <DropshipSection setPage={handleSetPage} />
            <Testimonials />
            <CTABanner setPage={handleSetPage} />
          </>
        } />
        <Route path="/products" element={<ProductsPage mode={mode} onAddToCart={handleAddToCart} products={products} />} />
        <Route path="/dropship" element={<DropshipPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>

      <AuthModal />
      <Footer setPage={handleSetPage} />
    </div>
  );
}
