import { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Camera,
  Package,
  MapPin,
  CreditCard,
  Star,
  Truck,
  Shield,
  Check,
  Home,
  Bolt as Lightning,
} from "lucide-react";

import API from "./api";
import text_logo from "./assets/img/text-kara-logo.png";
import full_logo from "./assets/img/kara_logo.jpeg";
import Footer from "./Footer";
const AppContext = createContext();
export default function UserPanel() {
  const [view, setView] = useState("home"); // No longer needed, but kept for compatibility if any
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const ORDER_FLOW = ["Pending", "Processing", "Confirmed", "Shipped", "Delivered"];
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
    country: "India",
  });
  const [selectedProduct, setSelectedProduct] = useState(null); // Can be deprecated if fetching in view
  const token = localStorage.getItem("token");

  /* ================= FETCH DATA ================= */
  const fetchProducts = async (filters = {}) => {
    try {
      const res = await API.get("/api/products", { params: filters });
      setProducts(res.data);
    } catch (err) {
      console.error("PRODUCT FETCH FAILED", err.response?.data || err.message);
      setProducts([]);
    }
  };

  const fetchProduct = async (id) => {
    try {
      const res = await API.get(`/api/products/${id}`);
      return res.data;
    } catch (err) {
      console.error("PRODUCT FETCH FAILED", err.response?.data || err.message);
      return null;
    }
  };

  useEffect(() => {
    // ALL PRODUCTS
    if (!selectedCategory) {
      fetchProducts();
      setSubcategories([]);
      return;
    }
    // CATEGORY SELECTED
    if (selectedCategory && !selectedSubcategory) {
      fetchProducts({ category: selectedCategory.name });
      (async () => {
        try {
          const res = await API.get("/api/products", {
            params: { category: selectedCategory.name },
          });
          const subs = [...new Set(res.data.map((p) => p.subcategory).filter(Boolean))];
          setSubcategories(subs);
        } catch (err) {
          console.error(err);
          setSubcategories([]);
        }
      })();
      return;
    }
    // CATEGORY + SUBCATEGORY
    fetchProducts({
      category: selectedCategory.name,
      subcategory: selectedSubcategory,
    });
  }, [selectedCategory, selectedSubcategory]);

  const fetchSlides = async () => {
    const res = await API.get("/api/slider");
    setSlides(res.data);
  };

  const fetchUser = async () => {
    try {
      const res = await API.get("/api/profile");
      setUser(res.data);
      setProfileForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Auth failed", err.response?.data || err.message);
      if (err.response?.status === 401) localStorage.removeItem("token");
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await API.get("/api/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Cart fetch failed", err);
    }
  };

  const addToCart = async (product) => {
    try {
      const res = await API.post("/api/cart/add", { product });
      setCart(res.data);
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  const updateProfile = async () => {
    const formData = new FormData();
    formData.append("name", profileForm.name);
    formData.append("email", profileForm.email);
    formData.append("phone", profileForm.phone);
    if (profileImage) formData.append("profileImage", profileImage);
    try {
      const res = await API.put("/api/profile", formData);
      setUser(res.data);
      alert("Profile updated!");
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  /* ================= SLIDER ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (slides.length ? (prev + 1) % slides.length : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, [slides]);

  /* ================= CART ================= */
  const removeFromCart = async (productId) => {
    try {
      const res = await API.delete("/api/cart/remove", { data: { productId } });
      setCart(res.data);
    } catch (err) {
      console.error("Remove from cart failed", err);
    }
  };

  const updateQuantity = async (productId, delta) => {
    const item = cart.find((p) => p.productId === productId);
    if (!item) return;
    let newQty = item.quantity + delta;
    if (newQty < 1) newQty = 1;
    try {
      const res = await API.put("/api/cart/update", { productId, quantity: newQty });
      setCart(res.data);
    } catch (err) {
      console.error("Update quantity failed", err);
    }
  };

  const fetchCategories = async () => {
    const res = await API.get("/api/categories");
    setCategories(res.data);
  };

  /* ================= ADDRESS ================= */
  const addNewAddress = async () => {
    try {
      const res = await API.post("/api/addresses", addressForm);
      setAddresses(res.data);
      setAddressForm({
        fullName: "",
        email: "",
        phone: "",
        addressLine: "",
        city: "",
        pincode: "",
        country: "India",
      });
    } catch (err) {
      console.error("Add address failed", err);
    }
  };

  /* ================= PAYMENT ================= */
  const startPayment = async () => {
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (!total) return alert("Cart is empty");
    try {
      const orderRes = await API.post("/api/payment/create-order", { amount: total });
      const options = {
        key: "rzp_test_RziTV0f7RSbzDC",
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Flipkart Clone",
        order_id: orderRes.data.id,
        handler: async (response) => {
          await API.post("/api/payment/verify", response);
          await API.post("/api/checkout", {
            cart,
            address: addresses[selectedAddress],
            paymentId: response.razorpay_payment_id,
          });
          alert("Order placed successfully!");
          setCart([]);
          // Navigate back to home
          const navigate = useNavigate();
          navigate("/");
        },
        theme: { color: "#2874F0" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const safeMoney = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString("en-IN");
  };

  const getItemPrice = (item) => Number(item?.price ?? item?.product?.price ?? 0);

  const getItemQty = (item) => Number(item?.quantity ?? 0);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const total = cart.reduce((sum, item) => sum + getItemPrice(item) * getItemQty(item), 0);

  useEffect(() => {
    const init = async () => {
      setAuthLoading(true);
      await fetchUser(); // must run first to verify token
      await fetchSlides();
      await fetchCart();
      await fetchCategories();
      setAuthLoading(false);
    };
    init();
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        cart,
        setCart,
        slides,
        currentSlide,
        setCurrentSlide,
        authLoading,
        user,
        setUser,
        categories,
        setCategories,
        subcategories,
        setSubcategories,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        ORDER_FLOW,
        profileForm,
        setProfileForm,
        profileImage,
        setProfileImage,
        expandedOrderId,
        setExpandedOrderId,
        addresses,
        setAddresses,
        selectedAddress,
        setSelectedAddress,
        addressForm,
        setAddressForm,
        selectedProduct,
        setSelectedProduct,
        fetchProducts,
        fetchProduct,
        fetchSlides,
        fetchUser,
        fetchCart,
        addToCart,
        updateProfile,
        removeFromCart,
        updateQuantity,
        fetchCategories,
        addNewAddress,
        startPayment,
        safeMoney,
        getItemPrice,
        getItemQty,
        logout,
        goToPrevSlide,
        goToNextSlide,
        total,
      }}
    >
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/cart" element={<CartView />} />
          <Route path="/checkout" element={<CheckoutView />} />
          <Route path="/product/:id" element={<ProductView />} />
        </Routes>
        <Footer/>
      </Router>
    </AppContext.Provider>
  );
}

function Header() {
  const navigate = useNavigate();
  const { cart, logout } = useContext(AppContext);

  return (
    <header className="shadow-header sticky top-0 z-50 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          <div className="flex flex-col items-start flex-shrink-0">
            <img src={full_logo} alt="" className="block md:hidden rounded-full w-20" /> {/* Original logo for small screens */}
            <img src={text_logo} alt="" className="hidden md:block" /> {/* Second/different logo for md and up */}
          </div>
          <div className="flex-1 max-w-xl">
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full pl-10 pr-4 py-2 rounded-sm bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div> */}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 px-4 py-1.5 text-primary-foreground hover:bg-primary-foreground/10 rounded-sm transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Profile</span>
              <ChevronDown className="w-3 h-3 hidden sm:inline" />
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1.5 px-4 py-1.5 text-primary-foreground hover:bg-primary-foreground/10 rounded-sm transition-colors relative"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              )}
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 px-4 py-1.5 text-primary-foreground hover:bg-primary-foreground/10 rounded-sm transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileView() {
  const navigate = useNavigate();
  const {
    user,
    profileForm,
    setProfileForm,
    profileImage,
    setProfileImage,
    expandedOrderId,
    setExpandedOrderId,
    updateProfile,
    safeMoney,
    ORDER_FLOW,
  } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Shopping</span>
        </button>
        {user && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <img
                      src={user.profileImage || "https://via.placeholder.com/120"}
                      alt="Profile"
                      className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" className="hidden" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-6 w-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Star className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Supercoins</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            {user.supercoins}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      placeholder="Enter your name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      placeholder="Enter your email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      placeholder="Enter your phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <button
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-200 hover:scale-105 transition-all duration-200"
                    onClick={updateProfile}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
              {/* Orders Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                </div>
                {user.orders?.length > 0 ? (
                  <div className="space-y-4">
                    {user.orders.map((o) => {
                      const isOpen = expandedOrderId === o._id;
                      return (
                        <div
                          key={o._id}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                        >
                          <button
                            onClick={() => setExpandedOrderId(isOpen ? null : o._id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-purple-600" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">
                                  {o.products.length} item{o.products.length > 1 ? "s" : ""}
                                </p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                  Order #{o._id.slice(-8).toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-gray-900">₹{safeMoney(o?.totalAmount ?? 0)}</p>
                              <span
                                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${o.status === "Delivered"
                                  ? "bg-green-100 text-green-700"
                                  : o.status === "Shipped"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-amber-100 text-amber-700"
                                  }`}
                              >
                                {o.status}
                              </span>
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 bg-white border-t border-gray-100">
                              <OrderTimeline status={o.status} createdAt={o.createdAt} updatedAt={o.updatedAt} />
                              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Products</p>
                                  <div className="space-y-2">
                                    {o.products.map((p, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-700 font-medium">{p.title}</span>
                                        <span className="text-gray-900 font-semibold">
                                          {p.quantity || 1} × ₹{safeMoney(p.price)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {o.address && (
                                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                                    <div className="flex items-start gap-2 mb-2">
                                      <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery Address</p>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      <span className="font-semibold">{o.address.fullName}</span>
                                      <br />
                                      {o.address.addressLine}
                                      <br />
                                      {o.address.city} - {o.address.pincode}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No orders yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start shopping to see your orders here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CartView() {
  const navigate = useNavigate();
  const { cart, total, safeMoney, updateQuantity, removeFromCart } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Continue Shopping</span>
        </button>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">My Cart ({cart.length})</h2>
              </div>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold mb-1">Your cart is empty</p>
                  <p className="text-gray-500 text-sm">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 pb-6 border-b border-gray-100 last:pb-0 last:border-0"
                    >
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={item.product?.images?.[0] || "https://via.placeholder.com/128"}
                          alt={item.title}
                          className="w-full h-full object-contain rounded-xl bg-gray-50"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.product?.category?.name || item.category}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-xl font-bold text-gray-900">₹{safeMoney(item.price)}</p>
                          <span className="text-sm text-gray-400 line-through">₹{safeMoney(item.price * 1.3)}</span>
                          <span className="text-sm font-semibold text-green-600">23% off</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-700" />
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Right Column - Price Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Price Details</h2>
              </div>
              <div className="space-y-4 pb-5 mb-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price ({cart.length} items)</span>
                  <span className="text-base font-semibold text-gray-900">₹{safeMoney(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivery Charges</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through">₹99</span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">FREE</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg p-3">
                  <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-700 font-medium">You're saving ₹99 on delivery!</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6 pb-5 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ₹{safeMoney(total)}
                </span>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-base py-4 rounded-xl hover:shadow-xl hover:shadow-purple-200 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                disabled={cart.length === 0}
              >
                Place Order
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">100% Safe and Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutView() {
  const navigate = useNavigate();
  const {
    cart,
    total,
    safeMoney,
    addresses,
    selectedAddress,
    setSelectedAddress,
    addressForm,
    setAddressForm,
    addNewAddress,
    startPayment,
  } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-gray-900 hidden sm:inline">Cart</span>
            </div>
            <div className="w-12 sm:w-20 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-4 ring-purple-100">
                2
              </div>
              <span className="text-sm font-semibold text-gray-900 hidden sm:inline">Address</span>
            </div>
            <div className="w-12 sm:w-20 h-0.5 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                3
              </div>
              <span className="text-sm font-medium text-gray-400 hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/cart")}
          className="group flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Cart</span>
        </button>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Address Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
              </div>
              {/* Existing Addresses */}
              {addresses.length > 0 && (
                <div className="space-y-3 mb-6">
                  {addresses.map((a, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAddress(idx)}
                      className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedAddress === idx
                        ? "border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md shadow-purple-100"
                        : "border-gray-200 hover:border-purple-300 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${selectedAddress === idx ? "border-purple-600 bg-purple-600" : "border-gray-300 group-hover:border-purple-400"
                            }`}
                        >
                          {selectedAddress === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="w-4 h-4 text-purple-600" />
                            <p className="font-semibold text-gray-900">{a.fullName}</p>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-1">{a.phone}</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {a.addressLine}, {a.city} - {a.pincode}, {a.country}
                          </p>
                        </div>
                        {selectedAddress === idx && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Add New Address Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                  Add New Address
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {["fullName", "email", "phone", "addressLine", "city", "pincode", "country"].map((f) => (
                    <div key={f} className={f === "addressLine" ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        {f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        placeholder={`Enter ${f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, " $1").toLowerCase()}`}
                        value={addressForm[f]}
                        onChange={(e) => setAddressForm({ ...addressForm, [f]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="mt-5 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-200 hover:scale-105 transition-all duration-200"
                  onClick={addNewAddress}
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Price Details</h2>
              </div>
              <div className="space-y-4 pb-5 mb-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price ({cart.length} items)</span>
                  <span className="text-base font-semibold text-gray-900">₹{safeMoney(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivery Charges</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through">₹99</span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">FREE</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg p-3">
                  <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-700 font-medium">You're saving ₹99 on delivery!</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6 pb-5 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ₹{safeMoney(total)}
                </span>
              </div>
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-base py-4 rounded-xl hover:shadow-xl hover:shadow-purple-200 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={startPayment}
              >
                Continue to Payment
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">100% Safe and Secure Payments</span>
              </div>
              <div className="mt-5 pt-5 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">We Accept</p>
                <div className="flex items-center justify-center gap-3 opacity-60">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700">VISA</div>
                  <div className="bg-gray-100 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700">UPI</div>
                  <div className="bg-gray-100 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700">Cards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cart, addToCart, safeMoney, fetchProduct } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [productSlide, setProductSlide] = useState(0);

  useEffect(() => {
    fetchProduct(id).then(setProduct);
  }, [id]);

  if (!product) return null;

  const isInCart = cart.some((i) => i.productId === product._id);
  const productImages = product.images || [];
  const goToPrevProductSlide = () => {
    setProductSlide((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };
  const goToNextProductSlide = () => {
    setProductSlide((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Products</span>
        </button>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Images */}
          <div className="space-y-4">
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg group">
              {productImages.length > 0 ? (
                <>
                  <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${productSlide * 100}%)` }}>
                    {productImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`${product.title} ${idx + 1}`} className="flex-shrink-0 w-full h-full object-contain" />
                    ))}
                  </div>
                  <button
                    onClick={goToPrevProductSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={goToNextProductSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setProductSlide(idx)}
                        className={`h-2 rounded-full transition-all ${idx === productSlide ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white/70"}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No images</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-20 h-20 object-contain rounded-lg cursor-pointer border-2 ${idx === productSlide ? "border-purple-600" : "border-gray-200"}`}
                  onClick={() => setProductSlide(idx)}
                />
              ))}
            </div>
          </div>
          {/* Right - Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{product.avgRating?.toFixed(1) || "0.0"}</span>
              </div>
              <span className="text-sm text-gray-600">({product.reviews?.length || 0} ratings)</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-gray-900">₹{safeMoney(product.price)}</p>
                <span className="text-xl text-gray-400 line-through">₹{safeMoney(product.price * 1.3)}</span>
                <span className="text-xl font-semibold text-green-600">23% off</span>
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
              <p className="text-gray-700 leading-relaxed">{product.description || "No description available."}</p>
            </div>
            <div className="flex gap-4">
              {isInCart ? (
                <button
                  onClick={() => navigate("/cart")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Go to Cart
                </button>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => {
                  if (!isInCart) addToCart(product);
                  navigate("/checkout");
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
              >
                <Lightning className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTimeline({ status, createdAt, updatedAt }) {
  const { ORDER_FLOW } = useContext(AppContext);
  const currentIndex = ORDER_FLOW.indexOf(status);
  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:justify-between">
        {ORDER_FLOW.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <div key={step} className="flex sm:flex-col items-start sm:items-center gap-3 sm:flex-1">
              <div
                className={`w-4 h-4 rounded-full flex-shrink-0 ${isCompleted ? "bg-primary" : isActive ? "bg-success" : "bg-muted-foreground/40"
                  }`}
              />
              {index !== ORDER_FLOW.length - 1 && <div className="hidden sm:block h-0.5 flex-1 bg-border mt-2" />}
              <div className="text-left sm:text-center">
                <p className={`text-sm font-medium ${isActive ? "text-success" : "text-foreground"}`}>{step}</p>
                {index === 0 && <p className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleDateString()}</p>}
                {isActive && updatedAt && (
                  <p className="text-xs text-muted-foreground">Updated: {new Date(updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeView() {
  const navigate = useNavigate();
  const {
    slides,
    currentSlide,
    categories,
    subcategories,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    products,
    safeMoney,
    addToCart,
    goToPrevSlide,
    goToNextSlide,
  } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20">
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Image Slider */}
        <div className="relative w-full h-56 sm:h-80 rounded-2xl overflow-hidden shadow-lg mb-8 group">
          {slides.length > 0 ? (
            <>
              <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide) => (
                  <a key={slide._id} href={slide.link || "#"} target="_blank" rel="noreferrer" className="flex-shrink-0 w-full h-full">
                    <img src={slide.image} alt={slide.title || "Banner"} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
              <button
                onClick={goToPrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-gray-900" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentSlide ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white/70"}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No banner images</p>
            </div>
          )}
        </div>
        {/* Category Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory("");
              }}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${!selectedCategory
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-600"
                }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubcategory("");
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${selectedCategory?._id === cat._id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-600"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        {/* Subcategory Buttons */}
        {subcategories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory("")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!selectedSubcategory
                  ? "bg-purple-100 text-purple-700 border-2 border-purple-600"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300"
                  }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSubcategory === sub
                    ? "bg-purple-100 text-purple-700 border-2 border-purple-600"
                    : "bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300"
                    }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              Products
            </h3>
            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">{products.length} items</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border-2 border-gray-100 hover:border-purple-600 hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden"
              >
                <div className="p-4" onClick={() => navigate(`/product/${product._id}`)}>
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">23% OFF</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                      {product.category?.name || product.category}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">{product.title}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-gray-900">{product.avgRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-xs text-gray-500">({product.reviews?.length || 0})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-gray-900">₹{safeMoney(product.price)}</p>
                      <span className="text-xs text-gray-400 line-through">₹{safeMoney(product.price * 1.3)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}