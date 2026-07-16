import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { CheckCircle2, Shield, Truck, Lock } from "lucide-react";

export default function Checkout() {
  const { cart, user, fetchUser, setAuthModalOpen } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addressIndex, setAddressIndex] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  const handlePayment = async () => {
    if (!cart.length) return alert("Cart is empty");
    if (!user || !user.addresses || user.addresses.length === 0) {
      return alert("Please add an address first in your profile.");
    }
    
    setLoading(true);
    try {
      // 1. Create Mongo Order
      const checkoutRes = await API.post("/api/checkout", {
        cart,
        address: user.addresses[addressIndex],
      });
      const mongoOrderId = checkoutRes.data.orderId;

      // 2. Create Razorpay Order
      const razorpayRes = await API.post("/api/payment/create-order", {
        orderId: mongoOrderId,
        amount: subtotal,
      });

      // 3. Configure Razorpay
      const options = {
        key: "rzp_test_RziTV0f7RSbzDC", // replace with your actual key if needed
        amount: razorpayRes.data.amount * 100,
        currency: "INR",
        name: "Kara Revamp",
        description: "Order Checkout",
        order_id: razorpayRes.data.id,
        handler: async (response: any) => {
          try {
            await API.post("/api/payment/verify-payment", {
              ...response,
              mongoOrderId,
            });
            alert("Payment Successful!");
            navigate("/"); // or to an order success page
          } catch (err) {
            console.error(err);
            alert("Payment Verification Failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#00e5ff",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong with checkout");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <p className="text-white text-xl mb-6">Please log in to checkout.</p>
        <button 
          onClick={() => setAuthModalOpen(true)}
          className="px-8 py-3 bg-[#00e5ff] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">Checkout</h1>
            <h2 className="text-xl font-semibold text-white mb-4">Shipping Address</h2>
            
            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map((addr, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setAddressIndex(idx)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      addressIndex === idx 
                        ? "border-[#00e5ff] bg-[#00e5ff]/10" 
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{addr.fullName}</p>
                        <p className="text-white/70 text-sm mt-1">{addr.addressLine}</p>
                        <p className="text-white/70 text-sm">{addr.city}, {addr.pincode}</p>
                        <p className="text-white/70 text-sm">{addr.country}</p>
                      </div>
                      {addressIndex === idx && <CheckCircle2 className="text-[#00e5ff] w-6 h-6" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-yellow-500/30 bg-yellow-500/10 rounded-xl text-yellow-200">
                You don't have any saved addresses. Please update your profile.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
              <Truck className="w-8 h-8 text-[#00e5ff] mb-2" />
              <h3 className="text-white font-medium">Free Shipping</h3>
              <p className="text-white/50 text-xs mt-1">On orders over $50</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
              <Shield className="w-8 h-8 text-[#00e5ff] mb-2" />
              <h3 className="text-white font-medium">Secure Checkout</h3>
              <p className="text-white/50 text-xs mt-1">256-bit encryption</p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => {
                const product = item.product;
                if (!product) return null;
                const imgUrl = product.images?.[0] ? `https://kara-8bl6.vercel.app/${product.images[0]}` : "https://via.placeholder.com/150";

                return (
                  <div key={item._id} className="flex gap-4">
                    <img src={imgUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-black/40" />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between">
                        <h4 className="text-white text-sm font-medium">{product.name}</h4>
                        <p className="text-white text-sm">${(product.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="text-white/50 text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 mt-6 pt-6 space-y-4">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between items-center text-white font-bold text-2xl pt-4 border-t border-white/10">
                <span>Total</span>
                <span className="text-[#00e5ff]">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !cart.length}
              className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-[#00e5ff] text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : (
                <>
                  <Lock className="w-5 h-5" />
                  Pay Securely
                </>
              )}
            </button>
            <p className="text-white/40 text-xs text-center mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
