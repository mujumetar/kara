import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API from "./api";
import "./AdminPanel.css";

const HF_TOKEN = "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";

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active page from URL
  const getActiveFromPath = () => {
    const path = location.pathname.split('/').pop();
    return path || 'dashboard';
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState({ users: '', orders: '', products: '' });
  const allowed = ["Pending", "Processing", "Confirmed", "Shipped", "Delivered"];
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    subcategory: "",
    description: "",
    stock: "",
    images: []
  });
  const ORDER_FLOW = [
    "Pending",
    "Processing",
    "Confirmed",
    "Shipped",
    "Delivered",
  ];
  const [slideForm, setSlideForm] = useState({ title: "", link: "", image: null });
  const [catForm, setCatForm] = useState({ name: "", subcategories: "" });
  const [editingCatId, setEditingCatId] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const pageSize = 10;
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const active = getActiveFromPath();
  const [templates, setTemplates] = useState([]);
  const [templateForm, setTemplateForm] = useState({
    name: "",           // ← add this
    key: "",
    subject: "",
    html: "",
    isActive: true,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const TEMPLATE_KEYS = [
    { value: "orderConfirmed", label: "Order Confirmed" },
    { value: "orderShipped", label: "Order Shipped" },
    { value: "orderDelivered", label: "Order Delivered" },
    { value: "paymentReminder", label: "Payment Reminder" },
    { value: "promo", label: "Promotional Email" },
    { value: "cartAbandoned", label: "Cart Abandoned Reminder" },
    { value: "accountWelcome", label: "Welcome Email" },
  ];
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const fetchTemplates = async () => {
    try {
      const res = await API.get("/api/admin/email-templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates", err);
    }
  };
  const saveTemplate = async () => {
    try {
      if (editingTemplateId) {
        await API.put(`/api/admin/email-templates/${editingTemplateId}`, templateForm);
      } else {
        await API.post("/api/admin/email-templates", templateForm);
      }

      // reset form...
      fetchTemplates();
      alert("Template saved successfully!");
    } catch (err) {
      console.error("Error saving template", err);

      // ← improved feedback
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.name?.message
        || "Failed to save template. Check all required fields.";

      alert(msg);
    }
  };


  // When editing
  const editTemplate = (t) => {
    setEditingTemplateId(t._id);
    setTemplateForm({
      name: t.name || "",
      key: t.key,
      subject: t.subject,
      html: t.html,
      isActive: t.isActive,
      type: t.type || "transactional",
    });
  };
  // In the form → add input for name
  <div className="admin-formGrid">

    <input
      className="admin-input"
      placeholder="Template Name (e.g. Order Confirmation Email)"
      value={templateForm.name}
      onChange={(e) =>
        setTemplateForm({ ...templateForm, name: e.target.value })
      }
    />

    <select
      className="admin-input"
      value={templateForm.type}
      onChange={(e) =>
        setTemplateForm({ ...templateForm, type: e.target.value })
      }
    >
      <option value="transactional">Transactional (auto-sent on events)</option>
      <option value="marketing">Marketing (manual / bulk send)</option>
    </select>

    <select
      className="admin-input"
      value={templateForm.key}
      onChange={(e) =>
        setTemplateForm({ ...templateForm, key: e.target.value })
      }
    >
      <option value="">Select Template Type</option>
      {TEMPLATE_KEYS.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>

  </div>

  const deleteTemplate = async (id) => {
    if (!confirm("Delete this template?")) return;
    await API.delete(`/api/admin/email-templates/${id}`);
    fetchTemplates();
  };

  useEffect(() => {
    fetchAll();
    fetchSlides();
    fetchStats();
    fetchTemplates();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodsRes, ordsRes, usrsRes, catsRes] = await Promise.all([
        API.get(`/api/products?search=${search.products}`),
        API.get(`/api/admin/orders?search=${search.orders}`),
        API.get(`/api/admin/users?search=${search.users}`),
        API.get("/api/categories")
      ]);
      setProducts(prodsRes.data);
      setOrders(ordsRes.data);
      setUsers(usrsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const fetchSlides = async () => {
    try {
      setSlides((await API.get("/api/slider")).data);
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/api/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
const CLOUD_NAME = "dlzy4t3i3";
const UPLOAD_PRESET = "xyz_abc";

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", "products");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: fd,
    }
  );

  const data = await res.json();
  return data.secure_url;
};

const addProduct = async () => {
  try {
    setLoading(true);

    let imageUrls = [];

// let imageUrls = [];

if (form.images.length > 0) {
  const uploaded = await Promise.all(
    form.images.map((img) => uploadToCloudinary(img))
  );

  // 🔴 REMOVE null / undefined
  imageUrls = uploaded.filter(Boolean);
}


    const payload = {
      title: form.title,
      price: form.price,
      category: form.category,
      subcategory: form.subcategory || "",
      description: form.description || "",
      stock: form.stock,
      images: imageUrls, // ✅ URLs only
    };

    if (editingProductId) {
      await API.put(`/api/products/${editingProductId}`, payload);
      setEditingProductId(null);
    } else {
      await API.post("/api/products", payload);
    }

    setForm({
      title: "",
      price: "",
      category: "",
      subcategory: "",
      description: "",
      stock: "",
      images: [],
    });

    setAvailableSubcategories([]);
    fetchAll();
  } catch (error) {
    console.error("Error adding product:", error);
    alert("Failed to save product");
  } finally {
    setLoading(false);
  }
};


  const generateDescription = async () => {
    if (!form.title) return alert("Product title is required");
    if (!form.images.length && !editingProductId) return alert("At least one image is required");
    setGeneratingDesc(true);
    try {
      let image;
      if (form.images.length > 0) {
        image = form.images[0];
      } else if (editingProductId) {
        const product = products.find(p => p._id === editingProductId);
        if (product?.images?.[0]) {
          const res = await fetch(product.images[0]);
          image = await res.blob();
        } else {
          return alert("No image available for generation");
        }
      }
      const formData = new FormData();
      formData.append('file', image, 'image.jpg');
      const captionRes = await axios.post(
        'https://router.huggingface.co/models/Salesforce/blip-image-captioning-base',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      const caption = captionRes.data[0].generated_text;
      const input = `Generate a detailed product description for "${form.title}": ${caption}`;
      const descRes = await axios.post(
        '/hf/models/distilgpt2',
        { inputs: input },
        {
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`
          }
        }
      );
      const description = descRes.data[0].generated_text.trim();
      setForm({ ...form, description });
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate description. Please try again.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await API.delete(`/api/products/${id}`);
    fetchAll();
  };

  const editProduct = (p) => {
    setEditingProductId(p._id);
    setForm({
      title: p.title,
      price: p.price,
      category: p.category,
      subcategory: p.subcategory,
      description: p.description,
      stock: p.stock,
      images: []
    });
    handleCategoryChange({ target: { value: p.category } });
  };


  const addSlide = async () => {
    const fd = new FormData();
    Object.keys(slideForm).forEach((k) => slideForm[k] && fd.append(k, slideForm[k]));
    if (editingSlideId) {
      await API.put(`/api/slider/${editingSlideId}`, fd);
      setEditingSlideId(null);
      setSlideForm({ title: "", link: "", image: null });
    } else {
      await API.post("/api/slider", fd);
      setSlideForm({ title: "", link: "", image: null });
    }
    fetchSlides();
  };

  const deleteSlide = async (id) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    await API.delete(`/api/slider/${id}`);
    fetchSlides();
  };

  const editSlide = (s) => {
    setEditingSlideId(s._id);
    setSlideForm({ title: s.title, link: s.link, image: null });
  };

  const addOrUpdateCategory = async () => {
    const subcats = catForm.subcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const data = { name: catForm.name, subcategories: subcats };
    try {
      if (editingCatId) {
        await API.put(`/api/categories/${editingCatId}`, data);
        setEditingCatId(null);
      } else {
        await API.post("/api/categories", data);
      }
      setCatForm({ name: "", subcategories: "" });
      fetchAll();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/api/categories/${id}`);
      fetchAll();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const editCategory = (cat) => {
    setEditingCatId(cat._id);
    setCatForm({
      name: cat.name,
      subcategories: cat.subcategories.join(", ")
    });
  };

  const handleCategoryChange = async (e) => {
    const val = e.target.value;
    setForm({ ...form, category: val, subcategory: "" });
    setAvailableSubcategories([]);
    if (val) {
      try {
        const res = await API.get(`/api/categories/${val}/subcategories`);
        setAvailableSubcategories(res.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    }
  };

  const handleSearchChange = (type, value) => {
    setSearch({ ...search, [type]: value });
    setTimeout(() => fetchAll(), 500);
  };

  const paginatedProducts = products.slice(
    (productPage - 1) * pageSize,
    productPage * pageSize
  );
  const paginatedOrders = orders.slice(
    (orderPage - 1) * pageSize,
    orderPage * pageSize
  );
  const paginatedUsers = users.slice(
    (userPage - 1) * pageSize,
    userPage * pageSize
  );

  const getUserDetails = (order) => {
    const user = order?.userId;
    return {
      name: user?.name || "N/A",
      email: user?.email || "N/A",
      phone: order?.address?.phone || "N/A",
    };
  };

  const nextPage = (current, setter, total) => {
    if (current * pageSize < total) setter(current + 1);
  };

  const prevPage = (current, setter) => {
    if (current > 1) setter(current - 1);
  };

  const navigateTo = (page) => {
    navigate(`/admin/${page}`);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "templates", label: "Templates", icon: "📧" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "supercoins", label: "Supercoins", icon: "💎" },
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "categories", label: "Categories", icon: "📁" },
    { id: "slider", label: "Slider", icon: "🖼️" }
  ];
  const handleSendMarketingEmail = async (template) => {
    if (!confirm(`Send "${template.name}" (${template.key}) to ALL active users? This is irreversible.`)) {
      return;
    }

    try {
      const res = await API.post("/api/admin/email/marketing-bulk", {
        templateKey: template.key,
        // You can later add custom fields like discountCode, offerImageUrl, etc.
      });

      alert(`Email campaign sent successfully to ${res.data.sent} users!`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send bulk email";
      alert(msg);
      console.error(err);
    }
  };

  useEffect(() => {
    if (!userSearch) return;
    const t = setTimeout(async () => {
      try {
        const res = await API.get("/api/admin/users", { params: { search: userSearch } });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 400); // debounce
    return () => clearTimeout(t);
  }, [userSearch]);

  
  const statusBadgeColors = {
    pending: { color: "#ef4444", background: "#fee2e2" },
    processing: { color: "#f59e0b", background: "#fef3c7" },
    confirmed: { color: "#2563eb", background: "#dbeafe" },
    shipped: { color: "#9333ea", background: "#f3e8ff" },
    delivered: { color: "#16a34a", background: "#dcfce7" },
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar" style={{
        width: sidebarCollapsed ? 80 : 260,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div className="admin-sidebarHeader">
          <h2 className="admin-logo" style={{
            opacity: sidebarCollapsed ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}>
            {!sidebarCollapsed && "Admin Panel"}
          </h2>
          <button
            className="admin-toggleBtn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? "☰" : "✕"}
          </button>
        </div>

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className="admin-menuBtn" style={{
              background: active === item.id ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
            }}
            title={sidebarCollapsed ? item.label : ""}
          >
            <span className="admin-menuIcon">{item.icon}</span>
            {!sidebarCollapsed && <span className="admin-menuLabel">{item.label}</span>}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <header className="admin-header">
          <h2>{active.toUpperCase()}</h2>
          <button
            className="admin-logoutBtn"
            onClick={() => {
              localStorage.clear();
              location.reload();
            }}
          >
            Logout
          </button>
        </header>

        {loading && <div className="admin-loading">Loading...</div>}

        {/* DASHBOARD */}
        {active === "dashboard" && (
          <section>
            <h3>Dashboard Stats</h3>
            <div className="admin-statsGrid">
              <div className="admin-statCard">
                <h4>Total Users</h4>
                <p className="admin-statValue">{stats.totalUsers || 0}</p>
              </div>
              <div className="admin-statCard">
                <h4>Total Orders</h4>
                <p className="admin-statValue">{stats.totalOrders || 0}</p>
              </div>
              <div className="admin-statCard">
                <h4>Total Revenue</h4>
                <p className="admin-statValue">₹{stats.totalRevenue || 0}</p>
              </div>
              <div className="admin-statCard">
                <h4>Pending Orders</h4>
                <p className="admin-statValue">{stats.pendingOrders || 0}</p>
              </div>
            </div>
          </section>
        )}
        {active === "supercoins" && (
          <section>
            <h3>Manage User Supercoins</h3>
            <div style={{ marginBottom: 20 }}>
              <input
                className="admin-input"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <select
                className="admin-input" style={{ marginTop: 10 }}
                value={selectedUser?._id || ""}
                onChange={e => {
                  const user = users.find(u => u._id === e.target.value);
                  setSelectedUser(user || null);
                }}
              >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) - {u.supercoins} coins
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="number"
                  placeholder="Amount"
                  className="admin-input"
                  value={coinAmount}
                  onChange={e => setCoinAmount(e.target.value)}
                />
                <button
                  className="admin-primaryBtn"
                  onClick={async () => {
                    if (!coinAmount || isNaN(coinAmount)) return alert("Enter valid amount");
                    try {
                      const res = await API.patch(`/api/admin/users/${selectedUser._id}/supercoins`, {
                        amount: Number(coinAmount),
                        action: "add" // or "deduct"
                      });
                      alert(`Updated! New balance: ${res.data.supercoins}`);
                      setSelectedUser({ ...selectedUser, supercoins: res.data.supercoins });
                      setCoinAmount("");
                      fetchAll(); // refresh users
                    } catch (err) {
                      console.error(err);
                      alert("Failed to update supercoins");
                    }
                  }}
                >
                  Add Coins
                </button>
                <button
                  className="admin-primaryBtn" style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" }}
                  onClick={async () => {
                    if (!coinAmount || isNaN(coinAmount)) return alert("Enter valid amount");
                    if (Number(coinAmount) > selectedUser.supercoins)
                      return alert("User doesn't have enough coins");
                    try {
                      const res = await API.patch(`/api/admin/users/${selectedUser._id}/supercoins`, {
                        amount: Number(coinAmount),
                        action: "deduct"
                      });
                      alert(`Updated! New balance: ${res.data.supercoins}`);
                      setSelectedUser({ ...selectedUser, supercoins: res.data.supercoins });
                      setCoinAmount("");
                      fetchAll();
                    } catch (err) {
                      console.error(err);
                      alert("Failed to deduct supercoins");
                    }
                  }}
                >
                  Deduct Coins
                </button>
                <span style={{ marginLeft: 20, fontWeight: 600 }}>
                  Current Balance: {selectedUser.supercoins} 💎
                </span>
              </div>
            )}
          </section>
        )}

        {/* PRODUCTS */}
        {active === "products" && (
          <section>
            <div className="admin-searchRow">
              <input
                className="admin-searchInput"
                placeholder="Search products..."
                value={search.products}
                onChange={(e) => handleSearchChange('products', e.target.value)}
              />
            </div>
            <h3>{editingProductId ? "Edit Product" : "Add Product"}</h3>
            <div className="admin-formGrid">
              <input
                className="admin-input"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="admin-input"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="admin-input"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <button
                className="admin-primaryBtn" style={{ gridColumn: 'span 2' }}
                onClick={generateDescription}
                disabled={generatingDesc}
              >
                {generatingDesc ? "Generating..." : "Generate Description with AI"}
              </button>
              <input
                className="admin-input"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <select
                className="admin-input"
                value={form.category}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className="admin-input"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                disabled={!form.category}
              >
                <option value="">Select Subcategory</option>
                {availableSubcategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                className="admin-fileInput"
                type="file"
                multiple
                onChange={(e) =>
                  setForm({ ...form, images: Array.from(e.target.files) })
                }
              />
            </div>
            <button className="admin-primaryBtn" onClick={addProduct}>
              {editingProductId ? "Update Product" : "Add Product"}
            </button>
            {editingProductId && (
              <button
                className="admin-primaryBtn" style={{ background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", marginLeft: 10 }}
                onClick={() => {
                  setEditingProductId(null);
                  setForm({ title: "", price: "", category: "", subcategory: "", description: "", stock: "", images: [] });
                }}
              >
                Cancel
              </button>
            )}
            <h3>Products</h3>
            <div className="table-container"><table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Image</th>
                  <th className="admin-th">Title</th>
                  <th className="admin-th">Category/Subcategory</th>
                  <th className="admin-th">Price</th>
                  <th className="admin-th">Stock</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p._id}>
                    <td className="admin-td"><img src={p.images?.[0]} width="40" alt="Product" style={{ borderRadius: 8 }} /></td>
                    <td className="admin-td">{p.title}</td>
                    <td className="admin-td">{p.category} / {p.subcategory}</td>
                    <td className="admin-td">₹{p.price}</td>
                    <td className="admin-td">{p.stock}</td>
                    <td className="admin-td">
                      <button className="admin-editBtn" onClick={() => editProduct(p)}>Edit</button>
                      <button className="admin-deleteBtn" onClick={() => deleteProduct(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <div className="admin-pagination">
              <button className="admin-paginationBtn" onClick={() => prevPage(productPage, setProductPage)}>Prev</button>
              <span className="admin-paginationText">Page {productPage}</span>
              <button className="admin-paginationBtn" onClick={() => nextPage(productPage, setProductPage, products.length)}>Next</button>
            </div>
          </section>
        )}

        {/* ORDERS */}
        {active === "orders" && (
          <section>
            <div className="admin-searchRow">
              <input
                className="admin-searchInput"
                placeholder="Search orders by user ID..."
                value={search.orders}
                onChange={(e) => handleSearchChange('orders', e.target.value)}
              />
            </div>
            <div className="table-container"><table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Order ID</th>
                  <th className="admin-th">User</th>
                  <th className="admin-th">Amount</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Created</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="admin-td">{o._id.slice(-6)}</td>
                    <td className="admin-td">{getUserDetails(o).name || o.userId}</td>
                    <td className="admin-td">₹{o.totalAmount}</td>
                    <td className="admin-td">
                      <span className="admin-statusBadge" style={{
                        color: statusBadgeColors[o.status.toLowerCase()]?.color,
                        background: statusBadgeColors[o.status.toLowerCase()]?.background
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="admin-td">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="admin-td">
                      <select
                        className="admin-statusSelect"
                        value={o.status}
                        onChange={async (e) => {
                          await API.patch(`/api/admin/orders/${o._id}/status`, {
                            status: e.target.value,
                          });
                          fetchAll();
                        }}
                      >
                        {allowed.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="admin-viewBtn" onClick={() => setExpandedOrder(expandedOrder?._id === o._id ? null : o)}>
                        {expandedOrder === o._id ? 'Hide' : 'View'}
                      </button>
                      <button className="admin-deleteBtn" onClick={async () => {
                        if (confirm('Delete order?')) {
                          await API.delete(`/api/admin/orders/${o._id}`);
                          fetchAll();
                        }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            {expandedOrder && (
              <div className="admin-orderDetails">
                <h4>Order Tracking</h4>
                <OrderTimeline
                  status={expandedOrder.status}
                  createdAt={expandedOrder.createdAt}
                  updatedAt={expandedOrder.updatedAt}
                  ORDER_FLOW={ORDER_FLOW}
                />
                <div className="admin-orderSection">
                  <h5>User Details</h5>
                  {(() => {
                    const user = getUserDetails(expandedOrder);
                    return (
                      <>
                        <p><b>Name:</b> {user.name}</p>
                        <p><b>Email:</b> {user.email}</p>
                        <p><b>Phone:</b> {user.phone}</p>
                      </>
                    );
                  })()}
                </div>
                {expandedOrder.address && (
                  <div className="admin-orderSection">
                    <h5>Delivery Address</h5>
                    {Object.entries(expandedOrder.address).map(([k, v]) => (
                      <p key={k}><b>{k}:</b> {v}</p>
                    ))}
                  </div>
                )}
                <div className="admin-orderSection">
                  <h5>Products</h5>
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th align="left">Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expandedOrder.products.map((p, i) => (
                        <tr key={i}>
                          <td>{p.title}</td>
                          <td align="center">{p.quantity || 1}</td>
                          <td align="center">₹{p.price}</td>
                          <td align="center">₹{(p.quantity || 1) * p.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>
              </div>
            )}
            <div className="admin-pagination">
              <button className="admin-paginationBtn" onClick={() => prevPage(orderPage, setOrderPage)}>Prev</button>
              <span className="admin-paginationText">Page {orderPage}</span>
              <button className="admin-paginationBtn" onClick={() => nextPage(orderPage, setOrderPage, orders.length)}>Next</button>
            </div>
          </section>
        )}

        {/* USERS */}
        {active === "users" && (
          <section>
            <div className="admin-searchRow">
              <input
                className="admin-searchInput"
                placeholder="Search users by name or email..."
                value={search.users}
                onChange={(e) => handleSearchChange('users', e.target.value)}
              />
            </div>
            <div className="table-container"><table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Name</th>
                  <th className="admin-th">Email</th>
                  <th className="admin-th">Phone</th>
                  <th className="admin-th">Supercoins</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="admin-td">{u.name}</td>
                    <td className="admin-td">{u.email}</td>
                    <td className="admin-td">{u.phone}</td>
                    <td className="admin-td">{u.supercoins}</td>
                    <td className="admin-td">
                      {u.isBanned ? (
                        <span className="admin-banned">BANNED</span>
                      ) : (
                        <span className="admin-active">ACTIVE</span>
                      )}
                    </td>
                    <td className="admin-td">
                      <button
                        className="admin-primaryBtn" style={{
                          background: u.isBanned ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                        }}
                        onClick={async () => {
                          await API.patch(`/api/admin/users/${u._id}/ban`);
                          fetchAll();
                        }}
                      >
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <div className="admin-pagination">
              <button className="admin-paginationBtn" onClick={() => prevPage(userPage, setUserPage)}>Prev</button>
              <span className="admin-paginationText">Page {userPage}</span>
              <button className="admin-paginationBtn" onClick={() => nextPage(userPage, setUserPage, users.length)}>Next</button>
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        {active === "categories" && (
          <section>
            <h3>{editingCatId ? "Update Category" : "Add Category"}</h3>
            <div className="admin-formGrid">
              <input
                className="admin-input"
                placeholder="Category Name"
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({ ...catForm, name: e.target.value })
                }
              />
              <textarea
                className="admin-input" style={{ height: "80px" }}
                placeholder="Subcategories (comma separated)"
                value={catForm.subcategories}
                onChange={(e) =>
                  setCatForm({ ...catForm, subcategories: e.target.value })
                }
              />
            </div>
            <button
              className="admin-primaryBtn"
              onClick={addOrUpdateCategory}
            >
              {editingCatId ? "Update Category" : "Add Category"}
            </button>
            {editingCatId && (
              <button
                className="admin-primaryBtn" style={{ background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", marginLeft: 10 }}
                onClick={() => {
                  setEditingCatId(null);
                  setCatForm({ name: "", subcategories: "" });
                }}
              >
                Cancel
              </button>
            )}
            <h3>Categories</h3>
            {categories.map((cat) => (
              <div key={cat._id} className="admin-card">
                <div>
                  <b>{cat.name}</b>: {cat.subcategories.join(", ")}
                </div>
                <div>
                  <button
                    className="admin-editBtn"
                    onClick={() => editCategory(cat)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-deleteBtn"
                    onClick={() => deleteCategory(cat._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SLIDER */}
        {active === "slider" && (
          <section>
            <h3>{editingSlideId ? "Edit Slide" : "Add Slide"}</h3>
            <div className="admin-formGrid">
              <input
                className="admin-input"
                placeholder="Title"
                value={slideForm.title}
                onChange={(e) =>
                  setSlideForm({ ...slideForm, title: e.target.value })
                }
              />
              <input
                className="admin-input"
                placeholder="Link"
                value={slideForm.link}
                onChange={(e) =>
                  setSlideForm({ ...slideForm, link: e.target.value })
                }
              />
              <input
                className="admin-fileInput"
                type="file"
                onChange={(e) =>
                  setSlideForm({ ...slideForm, image: e.target.files[0] })
                }
              />
            </div>
            <button className="admin-primaryBtn" onClick={addSlide}>
              {editingSlideId ? "Update Slide" : "Add Slide"}
            </button>
            {editingSlideId && (
              <button
                className="admin-primaryBtn" style={{ background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", marginLeft: 10 }}
                onClick={() => {
                  setEditingSlideId(null);
                  setSlideForm({ title: "", link: "", image: null });
                }}
              >
                Cancel
              </button>
            )}
            {slides.map((s) => (
              <div key={s._id} className="admin-card">
                <img src={s.image} width="100" alt="Slide" style={{ borderRadius: 12 }} />
                <div>{s.title} - {s.link}</div>
                <div>
                  <button className="admin-editBtn" onClick={() => editSlide(s)}>Edit</button>
                  <button className="admin-deleteBtn" onClick={() => deleteSlide(s._id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}


        {/* EMAIL TEMPLATES */}
        {active === "templates" && (
          <section>
            <h3>{editingTemplateId ? "Edit Template" : "Create Template"}</h3>

            <div className="admin-formGrid">
              {/* MUST HAVE THIS – name input */}
              <input
                className="admin-input"
                placeholder="Template Display Name (e.g. Order Confirmation Email)"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, name: e.target.value.trim() })
                }
                required
              />

              {/* Type selector – now safe because schema has it */}
              <select
                className="admin-input"
                value={templateForm.type || "transactional"}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, type: e.target.value })
                }
              >
                <option value="transactional">Transactional (auto-sent on events)</option>
                <option value="marketing">Marketing (manual / bulk send)</option>
              </select>

              <select
                className="admin-input"
                value={templateForm.key}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, key: e.target.value })
                }
              >
                <option value="">Select Template Type</option>
                {TEMPLATE_KEYS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <input
                className="admin-input"
                placeholder="Email Subject"
                value={templateForm.subject}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, subject: e.target.value })
                }
              />

              <textarea
                className="admin-input" style={{ gridColumn: "span 2", height: 140 }}
                placeholder="HTML Content (use {{name}}, {{orderId}}, {{amount}} etc.)"
                value={templateForm.html}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, html: e.target.value })
                }
              />
            </div>

            <button className="admin-primaryBtn" onClick={saveTemplate}>
              {editingTemplateId ? "Update Template" : "Save Template"}
            </button>

            {editingTemplateId && (
              <button
                className="admin-primaryBtn" style={{
                  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                  marginLeft: 10,
                }}
                onClick={() => {
                  setEditingTemplateId(null);
                  setTemplateForm({
                    name: "",
                    key: "",
                    subject: "",
                    html: "",
                    isActive: true,
                    type: "transactional",
                  });
                }}
              >
                Cancel
              </button>
            )}

            {/* Live Preview */}
            <div className="admin-card">
              <div>
                <b>Live Preview</b>
                <div
                  style={{
                    marginTop: 10,
                    padding: 16,
                    border: "1px dashed #cbd5e1",
                    borderRadius: 12,
                    background: "#fafafa",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: templateForm.html
                      .replace("{{name}}", "John Doe")
                      .replace("{{orderId}}", "ORD123")
                      .replace("{{amount}}", "₹999"),
                  }}
                />
              </div>
            </div>

            {/* Template List Table */}
            <div className="table-container"><table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Key</th>
                  <th className="admin-th">Name</th>
                  <th className="admin-th">Type</th>
                  <th className="admin-th">Subject</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t._id}>
                    <td className="admin-td">{t.key}</td>
                    <td className="admin-td">{t.name}</td>
                    <td className="admin-td">
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          background: t.type === "transactional" ? "#d1fae5" : "#fef3c7",
                          color: t.type === "transactional" ? "#065f46" : "#92400e",
                        }}
                      >
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="admin-td">{t.subject}</td>
                    <td className="admin-td">
                      {t.isActive ? (
                        <span className="admin-active">ACTIVE</span>
                      ) : (
                        <span className="admin-banned">DISABLED</span>
                      )}
                    </td>
                    <td className="admin-td">
                      <button className="admin-editBtn" onClick={() => editTemplate(t)}>
                        Edit
                      </button>
                      <button
                        className="admin-deleteBtn"
                        onClick={() => deleteTemplate(t._id)}
                      >
                        Delete
                      </button>

                      {t.type === "marketing" && (
                        <button
                          className="admin-primaryBtn" style={{
                            padding: "6px 12px",
                            fontSize: 13,
                            marginLeft: 8,
                            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                          }}
                          onClick={() => handleSendMarketingEmail(t)}
                        >
                          Send Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </section>
        )}

      </main>
    </div>
  );
}

function OrderTimeline({ status, createdAt, updatedAt, ORDER_FLOW }) {
  const currentIndex = ORDER_FLOW.indexOf(status);
  return (
    <div className="timeline-wrapper">
      {ORDER_FLOW.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <div key={step} className="timeline-step">
            {index !== 0 && (
              <div
                className="timeline-line" style={{
                  background: isCompleted ? "linear-gradient(180deg, #667eea 0%, #764ba2 100%)" : "#e5e7eb",
                }}
              />
            )}
            <div
              className="timeline-dot" style={{
                background: isCompleted
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : isActive
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "#cbd5e1",
                boxShadow: isActive ? "0 0 0 4px rgba(16, 185, 129, 0.2)" : "none",
              }}
            />
            <div className="timeline-label">
              <b style={{ color: isActive ? "#059669" : "#334155" }}>{step}</b>
              {index === 0 && (
                <div className="timeline-date">
                  {new Date(createdAt).toLocaleString()}
                </div>
              )}
              {isActive && updatedAt && (
                <div className="timeline-date">
                  Updated: {new Date(updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

