import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext, Product } from "../../context/AppContext";
import API from "../../api";
import { ShoppingCart, Star, ArrowLeft, Shield, Truck, Zap } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center flex-col">
        <p className="text-white text-xl mb-4">Product not found.</p>
        <button onClick={() => navigate("/products")} className="px-6 py-2 bg-[#00e5ff] text-black font-semibold rounded-lg">
          Back to Products
        </button>
      </div>
    );
  }

  const inCart = cart.some(item => item.productId === product._id);
  const imgUrl = product.images?.[0] ? `https://kara-8bl6.vercel.app/${product.images[0]}` : "https://via.placeholder.com/400";

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/products")} className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex items-center justify-center">
            <img src={imgUrl} alt={product.name} className="w-full max-w-md h-auto object-contain rounded-2xl shadow-2xl" />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-[#00e5ff]/20 text-[#00e5ff] px-3 py-1 rounded-full text-sm font-semibold border border-[#00e5ff]/30">
                {product.category}
              </span>
              <div className="flex items-center text-yellow-400 gap-1">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-white font-medium">{product.rating || 4.5}</span>
                <span className="text-white/50 text-sm ml-1">({product.reviews || 0} reviews)</span>
              </div>
            </div>

            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              {product.description || "Premium quality product crafted with attention to detail. Perfect for your everyday needs."}
            </p>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-5xl font-bold text-[#00e5ff]">${product.price}</span>
              {product.wholesalePrice && (
                <span className="text-white/40 text-xl line-through mb-1">${product.wholesalePrice}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
                <Truck className="w-6 h-6 text-[#00e5ff]" />
                <div>
                  <h4 className="text-white font-medium text-sm">Free Delivery</h4>
                  <p className="text-white/50 text-xs">Orders over $50</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#00e5ff]" />
                <div>
                  <h4 className="text-white font-medium text-sm">1 Year Warranty</h4>
                  <p className="text-white/50 text-xs">Full protection</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => inCart ? navigate("/cart") : addToCart(product)}
              className="w-full py-4 bg-[#00e5ff] text-black font-bold text-lg rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              {inCart ? "View in Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
