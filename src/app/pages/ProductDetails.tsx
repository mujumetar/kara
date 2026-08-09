import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import type { Product } from "../../context/AppContext";
import API from "../../api";
import {
  ShoppingCart, Star, ArrowLeft, Shield, Truck, Zap,
  Package, CheckCircle2, Heart, ChevronLeft, ChevronRight,
} from "lucide-react";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080e] pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#06080e] pt-24 flex items-center justify-center flex-col px-4">
        <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <p className="text-white text-xl mb-2 font-bold">Product not found</p>
        <p className="text-slate-500 text-sm mb-8">This product may no longer be available.</p>
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-7 py-3 rounded-xl transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
      </div>
    );
  }

  const inCart = cart.some((item) => item.productId === product._id);
  const images = product.images?.length ? product.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format"];
  const reviews = Array.isArray(product.reviews) ? product.reviews as unknown as Review[] : [];
  const avgRating = (product as any).avgRating || product.rating || 4.5;

  return (
    <div className="min-h-screen bg-[#06080e] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Images */}
          <div className="space-y-4">
            <div className="bg-[#0e1420] border border-white/5 rounded-2xl overflow-hidden aspect-square relative group">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format"; }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors"
              >
                <Heart className={`w-5 h-5 transition-colors ${wishlisted ? "text-red-400 fill-red-400" : "text-white"}`} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === i ? "border-orange-500" : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop&auto=format"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight mt-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-slate-700"}`}
                  />
                ))}
                <span className="text-amber-400 text-sm font-bold ml-1">{Number(avgRating).toFixed(1)}</span>
              </div>
              <span className="text-slate-600 text-sm">({reviews.length} reviews)</span>
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-red-400 text-sm font-semibold">Out of Stock</span>
              )}
            </div>

            <p className="text-slate-400 leading-relaxed mb-8">
              {product.description || "Premium quality product crafted with attention to detail. Perfect for your everyday needs."}
            </p>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-extrabold text-orange-400">₹{product.price.toFixed(2)}</span>
              {product.wholesalePrice && (
                <span className="text-slate-600 text-lg line-through mb-1">₹{product.wholesalePrice.toFixed(2)}</span>
              )}
              {product.wholesalePrice && (
                <span className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full mb-1">
                  {Math.round(((product.price - product.wholesalePrice) / product.wholesalePrice) * 100)}% off wholesale
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-[#0e1420] border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center text-white font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  if (inCart) {
                    navigate("/cart");
                  } else {
                    for (let i = 0; i < quantity; i++) addToCart(product);
                  }
                }}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {inCart ? "View in Cart" : "Add to Cart"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, title: "Free Delivery", sub: "Orders over ₹1000" },
                { icon: Shield, title: "1 Year Warranty", sub: "Full protection" },
                { icon: Zap, title: "Fast Dispatch", sub: "Within 48 hours" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="bg-[#0e1420] border border-white/5 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                  <p className="text-white text-xs font-bold">{title}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-extrabold text-white">Customer Reviews</h2>
              <div className="flex items-center gap-2 bg-amber-400/10 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-amber-400 font-bold text-sm">{Number(avgRating).toFixed(1)}</span>
                <span className="text-slate-500 text-xs">({reviews.length})</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review) => (
                <div key={review._id} className="bg-[#0e1420] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-bold text-sm">{review.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed italic">"{review.comment}"</p>
                  <p className="text-slate-600 text-xs mt-3">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
