import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  rating?: number;
  reviews?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  addresses: any[];
}

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  cart: any[];
  products: Product[];
  categories: any[];
  subcategories: any[];
  fetchProducts: (filters?: any) => Promise<void>;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, delta: number) => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchCart: () => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await API.get("/api/profile");
      setUser(res.data);
    } catch (err: any) {
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

  const fetchProducts = async (filters = {}) => {
    try {
      const res = await API.get("/api/products", { params: filters });
      setProducts(res.data);
    } catch (err) {
      console.error("PRODUCT FETCH FAILED", err);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const addToCart = async (product: any, quantity: number = 1) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await API.post("/api/cart/add", { product, quantity });
      setCart(res.data);
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await API.delete("/api/cart/remove", { data: { productId } });
      setCart(res.data);
    } catch (err) {
      console.error("Remove from cart failed", err);
    }
  };

  const updateQuantity = async (productId: string, delta: number) => {
    const item = cart.find((p) => p.productId === productId || p._id === productId);
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

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCart([]);
  };

  useEffect(() => {
    fetchUser();
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        cart,
        products,
        categories,
        subcategories,
        fetchProducts,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchUser,
        fetchCart,
        logout,
        isAuthModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
