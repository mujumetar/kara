import { useAppContext } from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useAppContext();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#00e5ff]" />
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-md">
            <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-white/60 mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/products" className="px-6 py-3 bg-[#00e5ff] text-black font-semibold rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const product = item.product;
                if (!product) return null;
                const imgUrl = product.images?.[0] ? `https://kara-8bl6.vercel.app/${product.images[0]}` : "https://via.placeholder.com/150";

                return (
                  <div key={item._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 backdrop-blur-md">
                    <img src={imgUrl} alt={product.name} className="w-24 h-24 object-cover rounded-xl bg-black/40" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white">{product.name}</h3>
                          <p className="text-white/60 text-sm">{product.category}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-white/40 hover:text-red-400 p-2 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/5">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white/10 rounded-md text-white/70">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white/10 rounded-md text-white/70">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xl font-bold text-[#00e5ff]">${(product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-white font-bold text-xl">
                  <span>Total</span>
                  <span className="text-[#00e5ff]">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate("/checkout")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#00e5ff] text-black font-semibold rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
