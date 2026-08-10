import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { CheckCircle2, Shield, Truck, Lock, MapPin, Plus } from "lucide-react";

export default function Checkout() {
  const { cart, user, setAuthModalOpen } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addressIndex, setAddressIndex] = useState(0);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "", addressLine: "", city: "", pincode: "", country: "India",
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.addressLine || !newAddress.city || !newAddress.pincode) {
      alert("Please fill all address fields");
      return;
    }
    try {
      await API.post("/api/addresses", newAddress);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to add address");
    }
  };

  const handlePayment = async () => {
    if (!cart.length) return alert("Cart is empty");
    if (!user || !user.addresses || user.addresses.length === 0) {
      return alert("Please add an address first.");
    }

    setLoading(true);
    try {
      // Step 1 — create mongo order
      const checkoutRes = await API.post("/api/checkout", {
        cart,
        address: user.addresses[addressIndex],
      });
      const mongoOrderId = checkoutRes.data.orderId;

      // Step 2 — try Razorpay
      try {
        const razorpayRes = await API.post("/api/payment/create-order", { orderId: mongoOrderId });

        const options = {
          key: "rzp_test_RziTV0f7RSbzDC",
          amount: razorpayRes.data.amount * 100,
          currency: "INR",
          name: "SN Dropshipping",
          description: "Order Checkout",
          order_id: razorpayRes.data.razorpayOrderId,
          handler: async (response: any) => {
            try {
              await API.post("/api/payment/verify", { ...response, orderId: mongoOrderId });
              alert("Payment Successful! Your order has been placed.");
              navigate("/profile");
            } catch {
              alert("Payment Verification Failed. Please contact support.");
            }
          },
          prefill: { name: user.name, email: user.email, contact: user.phone },
          theme: { color: "#f97316" },
          modal: { ondismiss: () => setLoading(false) },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (rzpErr: any) {
        // Razorpay failed — offer COD
        const detail = rzpErr.response?.data?.detail || "Razorpay unavailable";
        const useCOD = confirm(`Online payment failed (${detail}).\n\nWould you like to place the order with Cash on Delivery instead?`);
        if (useCOD) {
          await API.post("/api/payment/cod", { orderId: mongoOrderId });
          alert("Order placed successfully with Cash on Delivery!");
          navigate("/profile");
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong with checkout");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#06080e] pt-24 flex flex-col items-center justify-center px-4">
        <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-12 text-center max-w-md w-full">
          <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Sign in to checkout</h2>
          <p className="text-slate-500 mb-8">Please log in to place your order.</p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 text-sm"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080e] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">Final Step</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left – Address */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Shipping Address
              </h2>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {user.addresses.map((addr: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setAddressIndex(idx)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                        addressIndex === idx
                          ? "border-orange-500/50 bg-orange-500/5"
                          : "border-white/5 bg-[#0e1420] hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-sm">{addr.fullName}</p>
                          <p className="text-slate-400 text-sm mt-0.5">{addr.addressLine}</p>
                          <p className="text-slate-500 text-sm">{addr.city}, {addr.pincode}</p>
                          <p className="text-slate-500 text-sm">{addr.country}</p>
                        </div>
                        {addressIndex === idx && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-2xl text-amber-300 text-sm mb-4">
                  No saved addresses. Add one below.
                </div>
              )}

              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add new address
              </button>

              {showAddAddress && (
                <div className="mt-4 bg-[#0e1420] border border-white/5 rounded-2xl p-5 space-y-3">
                  {[
                    { key: "fullName", label: "Full Name", placeholder: "John Doe" },
                    { key: "addressLine", label: "Address", placeholder: "123 Main St, Apt 4B" },
                    { key: "city", label: "City", placeholder: "Mumbai" },
                    { key: "pincode", label: "Pincode", placeholder: "400001" },
                    { key: "country", label: "Country", placeholder: "India" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        value={(newAddress as any)[key]}
                        onChange={(e) => setNewAddress({ ...newAddress, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleAddAddress}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-all text-sm"
                  >
                    Save Address
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0e1420] rounded-2xl border border-white/5 flex items-center gap-3">
                <Truck className="w-8 h-8 text-orange-500 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-sm">Free Shipping</h3>
                  <p className="text-slate-500 text-xs mt-0.5">On orders over ₹1000</p>
                </div>
              </div>
              <div className="p-4 bg-[#0e1420] rounded-2xl border border-white/5 flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-500 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-sm">Secure Checkout</h3>
                  <p className="text-slate-500 text-xs mt-0.5">256-bit encryption</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right – Summary */}
          <div>
            <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6 sticky top-28">
              <h2 className="text-lg font-extrabold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 mb-6">
                {cart.map((item) => {
                  const imgUrl = item.image || "";
                  const productId = item.productId || item._id || "";
                  const price = item.price || 0;
                  const title = item.title || item.name || "Product";
                  return (
                    <div key={productId} className="flex gap-3">
                      <div className="w-14 h-14 bg-[#0a0f1a] rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={imgUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop&auto=format"; }}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between gap-2">
                          <h4 className="text-white text-xs font-semibold leading-snug line-clamp-2">{title}</h4>
                          <p className="text-orange-400 text-sm font-bold flex-shrink-0">₹{(price * (item.quantity || 1)).toFixed(2)}</p>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/5 pt-5 space-y-3">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-white font-extrabold text-lg">Total</span>
                  <span className="text-orange-400 font-extrabold text-2xl">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !cart.length}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay with Razorpay
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-slate-600 text-xs">or</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <button
                onClick={handleCOD}
                disabled={loading || !cart.length}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Truck className="w-4 h-4 text-emerald-400" />
                Cash on Delivery
              </button>

              <p className="text-slate-600 text-xs text-center mt-3">
                By placing your order, you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
