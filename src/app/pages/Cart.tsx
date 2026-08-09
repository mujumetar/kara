import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Package } from "lucide-react";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, user, setAuthModalOpen } = useAppContext();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => {
    const price = item.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  return (
    <div className="min-h-screen bg-[#06080e] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">Your Order</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-orange-500" />
            Shopping Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-16 text-center">
            <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-7 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 text-sm"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const imgUrl = item.image || "";
                const productId = item.productId || item._id || "";
                const price = item.price || 0;
                const title = item.title || item.name || "Product";

                return (
                  <div key={productId} className="bg-[#0e1420] border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-white/10 transition-colors">
                    <div className="w-24 h-24 bg-[#0a0f1a] rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={imgUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop&auto=format"; }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-bold text-sm leading-snug">{title}</h3>
                          <p className="text-orange-400 font-extrabold text-lg mt-1">₹{price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2 bg-black/30 rounded-xl p-1 border border-white/5">
                          <button
                            onClick={() => updateQuantity(productId, -1)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-white font-bold text-sm">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(productId, 1)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-orange-400 font-extrabold">₹{(price * (item.quantity || 1)).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#0e1420] border border-white/5 rounded-2xl p-6 h-fit sticky top-28">
              <h2 className="text-lg font-extrabold text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="text-white font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">Calculated at checkout</span>
                </div>
                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-white font-extrabold">Total</span>
                  <span className="text-orange-400 font-extrabold text-2xl">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => user ? navigate("/checkout") : setAuthModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 text-sm"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/products")}
                className="w-full mt-3 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-semibold rounded-xl transition-all text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
