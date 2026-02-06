import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API from "./api";

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
  <div style={styles.formGrid}>

    <input
      style={styles.input}
      placeholder="Template Name (e.g. Order Confirmation Email)"
      value={templateForm.name}
      onChange={(e) =>
        setTemplateForm({ ...templateForm, name: e.target.value })
      }
    />

    <select
      style={styles.input}
      value={templateForm.type}
      onChange={(e) =>
        setTemplateForm({ ...templateForm, type: e.target.value })
      }
    >
      <option value="transactional">Transactional (auto-sent on events)</option>
      <option value="marketing">Marketing (manual / bulk send)</option>
    </select>

    <select
      style={styles.input}
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

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "YOUR_UNSIGNED_PRESET"); // ← important
  fd.append("folder", "products");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dlzy4t3i3/image/upload",
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
    let imageUrls = [];

    if (form.images.length > 0) {
      imageUrls = await Promise.all(
        form.images.map((file) => uploadToCloudinary(file))
      );
    }

    const payload = {
      title: form.title,
      price: form.price,
      category: form.category,
      subcategory: form.subcategory,
      description: form.description,
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

    fetchAll();
  } catch (err) {
    console.error("Error saving product:", err);
    alert("Failed to save product");
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

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarCollapsed ? 80 : 260,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={{
            ...styles.logo,
            opacity: sidebarCollapsed ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}>
            {!sidebarCollapsed && "Admin Panel"}
          </h2>
          <button
            style={styles.toggleBtn}
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
            style={{
              ...styles.menuBtn,
              background: active === item.id ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
            }}
            title={sidebarCollapsed ? item.label : ""}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            {!sidebarCollapsed && <span style={styles.menuLabel}>{item.label}</span>}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2>{active.toUpperCase()}</h2>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              localStorage.clear();
              location.reload();
            }}
          >
            Logout
          </button>
        </header>

        {loading && <div style={styles.loading}>Loading...</div>}

        {/* DASHBOARD */}
        {active === "dashboard" && (
          <section>
            <h3>Dashboard Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h4>Total Users</h4>
                <p style={styles.statValue}>{stats.totalUsers || 0}</p>
              </div>
              <div style={styles.statCard}>
                <h4>Total Orders</h4>
                <p style={styles.statValue}>{stats.totalOrders || 0}</p>
              </div>
              <div style={styles.statCard}>
                <h4>Total Revenue</h4>
                <p style={styles.statValue}>₹{stats.totalRevenue || 0}</p>
              </div>
              <div style={styles.statCard}>
                <h4>Pending Orders</h4>
                <p style={styles.statValue}>{stats.pendingOrders || 0}</p>
              </div>
            </div>
          </section>
        )}
        {active === "supercoins" && (
          <section>
            <h3>Manage User Supercoins</h3>
            <div style={{ marginBottom: 20 }}>
              <input
                style={styles.input}
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <select
                style={{ ...styles.input, marginTop: 10 }}
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
                  style={styles.input}
                  value={coinAmount}
                  onChange={e => setCoinAmount(e.target.value)}
                />
                <button
                  style={styles.primaryBtn}
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
                  style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" }}
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
            <div style={styles.searchRow}>
              <input
                style={styles.searchInput}
                placeholder="Search products..."
                value={search.products}
                onChange={(e) => handleSearchChange('products', e.target.value)}
              />
            </div>
            <h3>{editingProductId ? "Edit Product" : "Add Product"}</h3>
            <div style={styles.formGrid}>
              <input
                style={styles.input}
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <button
                style={{ ...styles.primaryBtn, gridColumn: 'span 2' }}
                onClick={generateDescription}
                disabled={generatingDesc}
              >
                {generatingDesc ? "Generating..." : "Generate Description with AI"}
              </button>
              <input
                style={styles.input}
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <select
                style={styles.input}
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
                style={styles.input}
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
                style={styles.fileInput}
                type="file"
                multiple
                onChange={(e) =>
                  setForm({ ...form, images: Array.from(e.target.files) })
                }
              />
            </div>
            <button style={styles.primaryBtn} onClick={addProduct}>
              {editingProductId ? "Update Product" : "Add Product"}
            </button>
            {editingProductId && (
              <button
                style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", marginLeft: 10 }}
                onClick={() => {
                  setEditingProductId(null);
                  setForm({ title: "", price: "", category: "", subcategory: "", description: "", stock: "", images: [] });
                }}
              >
                Cancel
              </button>
            )}
            <h3>Products</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category/Subcategory</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p._id}>
                    <td style={styles.td}><img src={p.images?.[0]} width="40" alt="Product" style={{ borderRadius: 8 }} /></td>
                    <td style={styles.td}>{p.title}</td>
                    <td style={styles.td}>{p.category} / {p.subcategory}</td>
                    <td style={styles.td}>₹{p.price}</td>
                    <td style={styles.td}>{p.stock}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => editProduct(p)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => deleteProduct(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.pagination}>
              <button style={styles.paginationBtn} onClick={() => prevPage(productPage, setProductPage)}>Prev</button>
              <span style={styles.paginationText}>Page {productPage}</span>
              <button style={styles.paginationBtn} onClick={() => nextPage(productPage, setProductPage, products.length)}>Next</button>
            </div>
          </section>
        )}

        {/* ORDERS */}
        {active === "orders" && (
          <section>
            <div style={styles.searchRow}>
              <input
                style={styles.searchInput}
                placeholder="Search orders by user ID..."
                value={search.orders}
                onChange={(e) => handleSearchChange('orders', e.target.value)}
              />
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o) => (
                  <tr key={o._id}>
                    <td style={styles.td}>{o._id.slice(-6)}</td>
                    <td style={styles.td}>{getUserDetails(o).name || o.userId}</td>
                    <td style={styles.td}>₹{o.totalAmount}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        color: styles.statusBadgeColors[o.status.toLowerCase()]?.color,
                        background: styles.statusBadgeColors[o.status.toLowerCase()]?.background
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <select
                        style={styles.statusSelect}
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
                      <button style={styles.viewBtn} onClick={() => setExpandedOrder(expandedOrder?._id === o._id ? null : o)}>
                        {expandedOrder === o._id ? 'Hide' : 'View'}
                      </button>
                      <button style={styles.deleteBtn} onClick={async () => {
                        if (confirm('Delete order?')) {
                          await API.delete(`/api/admin/orders/${o._id}`);
                          fetchAll();
                        }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expandedOrder && (
              <div style={styles.orderDetails}>
                <h4>Order Tracking</h4>
                <OrderTimeline
                  status={expandedOrder.status}
                  createdAt={expandedOrder.createdAt}
                  updatedAt={expandedOrder.updatedAt}
                  ORDER_FLOW={ORDER_FLOW}
                />
                <div style={styles.orderSection}>
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
                  <div style={styles.orderSection}>
                    <h5>Delivery Address</h5>
                    {Object.entries(expandedOrder.address).map(([k, v]) => (
                      <p key={k}><b>{k}:</b> {v}</p>
                    ))}
                  </div>
                )}
                <div style={styles.orderSection}>
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
                  </table>
                </div>
              </div>
            )}
            <div style={styles.pagination}>
              <button style={styles.paginationBtn} onClick={() => prevPage(orderPage, setOrderPage)}>Prev</button>
              <span style={styles.paginationText}>Page {orderPage}</span>
              <button style={styles.paginationBtn} onClick={() => nextPage(orderPage, setOrderPage, orders.length)}>Next</button>
            </div>
          </section>
        )}

        {/* USERS */}
        {active === "users" && (
          <section>
            <div style={styles.searchRow}>
              <input
                style={styles.searchInput}
                placeholder="Search users by name or email..."
                value={search.users}
                onChange={(e) => handleSearchChange('users', e.target.value)}
              />
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Supercoins</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u._id}>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.phone}</td>
                    <td style={styles.td}>{u.supercoins}</td>
                    <td style={styles.td}>
                      {u.isBanned ? (
                        <span style={styles.banned}>BANNED</span>
                      ) : (
                        <span style={styles.active}>ACTIVE</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{
                          ...styles.primaryBtn,
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
            </table>
            <div style={styles.pagination}>
              <button style={styles.paginationBtn} onClick={() => prevPage(userPage, setUserPage)}>Prev</button>
              <span style={styles.paginationText}>Page {userPage}</span>
              <button style={styles.paginationBtn} onClick={() => nextPage(userPage, setUserPage, users.length)}>Next</button>
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        {active === "categories" && (
          <section>
            <h3>{editingCatId ? "Update Category" : "Add Category"}</h3>
            <div style={styles.formGrid}>
              <input
                style={styles.input}
                placeholder="Category Name"
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({ ...catForm, name: e.target.value })
                }
              />
              <textarea
                style={{ ...styles.input, height: "80px" }}
                placeholder="Subcategories (comma separated)"
                value={catForm.subcategories}
                onChange={(e) =>
                  setCatForm({ ...catForm, subcategories: e.target.value })
                }
              />
            </div>
            <button
              style={styles.primaryBtn}
              onClick={addOrUpdateCategory}
            >
              {editingCatId ? "Update Category" : "Add Category"}
            </button>
            {editingCatId && (
              <button
                style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", marginLeft: 10 }}
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
              <div key={cat._id} style={styles.card}>
                <div>
                  <b>{cat.name}</b>: {cat.subcategories.join(", ")}
                </div>
                <div>
                  <button
                    style={styles.editBtn}
                    onClick={() => editCategory(cat)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
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
            <div style={styles.formGrid}>
              <input
                style={styles.input}
                placeholder="Title"
                value={slideForm.title}
                onChange={(e) =>
                  setSlideForm({ ...slideForm, title: e.target.value })
                }
              />
              <input
                style={styles.input}
                placeholder="Link"
                value={slideForm.link}
                onChange={(e) =>
                  setSlideForm({ ...slideForm, link: e.target.value })
                }
              />
              <input
                style={styles.fileInput}
                type="file"
                onChange={(e) =>
                  setSlideForm({ ...slideForm, image: e.target.files[0] })
                }
              />
            </div>
            <button style={styles.primaryBtn} onClick={addSlide}>
              {editingSlideId ? "Update Slide" : "Add Slide"}
            </button>
            {editingSlideId && (
              <button
                style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", marginLeft: 10 }}
                onClick={() => {
                  setEditingSlideId(null);
                  setSlideForm({ title: "", link: "", image: null });
                }}
              >
                Cancel
              </button>
            )}
            {slides.map((s) => (
              <div key={s._id} style={styles.card}>
                <img src={s.image} width="100" alt="Slide" style={{ borderRadius: 12 }} />
                <div>{s.title} - {s.link}</div>
                <div>
                  <button style={styles.editBtn} onClick={() => editSlide(s)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => deleteSlide(s._id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}


        {/* EMAIL TEMPLATES */}
        {active === "templates" && (
          <section>
            <h3>{editingTemplateId ? "Edit Template" : "Create Template"}</h3>

            <div style={styles.formGrid}>
              {/* MUST HAVE THIS – name input */}
              <input
                style={styles.input}
                placeholder="Template Display Name (e.g. Order Confirmation Email)"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, name: e.target.value.trim() })
                }
                required
              />

              {/* Type selector – now safe because schema has it */}
              <select
                style={styles.input}
                value={templateForm.type || "transactional"}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, type: e.target.value })
                }
              >
                <option value="transactional">Transactional (auto-sent on events)</option>
                <option value="marketing">Marketing (manual / bulk send)</option>
              </select>

              <select
                style={styles.input}
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
                style={styles.input}
                placeholder="Email Subject"
                value={templateForm.subject}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, subject: e.target.value })
                }
              />

              <textarea
                style={{ ...styles.input, gridColumn: "span 2", height: 140 }}
                placeholder="HTML Content (use {{name}}, {{orderId}}, {{amount}} etc.)"
                value={templateForm.html}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, html: e.target.value })
                }
              />
            </div>

            <button style={styles.primaryBtn} onClick={saveTemplate}>
              {editingTemplateId ? "Update Template" : "Save Template"}
            </button>

            {editingTemplateId && (
              <button
                style={{
                  ...styles.primaryBtn,
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
            <div style={styles.card}>
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
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Key</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t._id}>
                    <td style={styles.td}>{t.key}</td>
                    <td style={styles.td}>{t.name}</td>
                    <td style={styles.td}>
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
                    <td style={styles.td}>{t.subject}</td>
                    <td style={styles.td}>
                      {t.isActive ? (
                        <span style={styles.active}>ACTIVE</span>
                      ) : (
                        <span style={styles.banned}>DISABLED</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => editTemplate(t)}>
                        Edit
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteTemplate(t._id)}
                      >
                        Delete
                      </button>

                      {t.type === "marketing" && (
                        <button
                          style={{
                            ...styles.primaryBtn,
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
            </table>
          </section>
        )}

      </main>
    </div>
  );
}

function OrderTimeline({ status, createdAt, updatedAt, ORDER_FLOW }) {
  const currentIndex = ORDER_FLOW.indexOf(status);
  return (
    <div style={timelineStyles.wrapper}>
      {ORDER_FLOW.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <div key={step} style={timelineStyles.step}>
            {index !== 0 && (
              <div
                style={{
                  ...timelineStyles.line,
                  background: isCompleted ? "linear-gradient(180deg, #667eea 0%, #764ba2 100%)" : "#e5e7eb",
                }}
              />
            )}
            <div
              style={{
                ...timelineStyles.dot,
                background: isCompleted
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : isActive
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "#cbd5e1",
                boxShadow: isActive ? "0 0 0 4px rgba(16, 185, 129, 0.2)" : "none",
              }}
            />
            <div style={timelineStyles.label}>
              <b style={{ color: isActive ? "#059669" : "#334155" }}>{step}</b>
              {index === 0 && (
                <div style={timelineStyles.date}>
                  {new Date(createdAt).toLocaleString()}
                </div>
              )}
              {isActive && updatedAt && (
                <div style={timelineStyles.date}>
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

/* ================= MODERN STYLES ================= */
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sidebar: {
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    color: "#fff",
    padding: "20px",
    boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
    position: "relative",
    overflow: "hidden",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: 800,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
    margin: 0,
  },
  toggleBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#fff",
    width: 36,
    height: 36,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  menuBtn: {
    width: "100%",
    padding: "14px 18px",
    marginBottom: 8,
    border: "none",
    borderRadius: 12,
    color: "#cbd5e1",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    fontSize: "15px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
    minWidth: 24,
  },
  menuLabel: {
    whiteSpace: "nowrap",
  },
  main: {
    flex: 1,
    padding: 32,
    background: "#f8fafc",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    padding: "24px 28px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid rgba(255,255,255,0.5)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 20,
    marginBottom: 24,
  },
  input: {
    padding: "14px 18px",
    borderRadius: 12,
    border: "2px solid #e2e8f0",
    fontSize: 15,
    background: "#ffffff",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },
  fileInput: {
    padding: 14,
    borderRadius: 12,
    border: "2px dashed #cbd5e1",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: 14,
    fontWeight: 500,
  },
  primaryBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 20,
    fontSize: 15,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
  },
  logoutBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  },
  card: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: 20,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    justifyContent: "space-between",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.3s ease",
  },
  orderDetails: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: 28,
    borderRadius: 16,
    marginTop: 24,
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
  },
  orderSection: {
    marginBottom: 20,
    padding: "16px 20px",
    border: "2px solid #e2e8f0",
    borderRadius: 12,
    background: "#fafbfc",
    transition: "all 0.3s ease",
  },
  editBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginRight: 6,
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
  },
  deleteBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
  },
  viewBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: 6,
    marginRight: 6,
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    background: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
  },
  th: {
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    padding: "16px 18px",
    textAlign: "left",
    fontWeight: 700,
    fontSize: 14,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "16px 18px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    color: "#334155",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-block",
  },
  statusBadgeColors: {
    pending: { color: "#ef4444", background: "#fee2e2" },
    processing: { color: "#f59e0b", background: "#fef3c7" },
    confirmed: { color: "#2563eb", background: "#dbeafe" },
    shipped: { color: "#9333ea", background: "#f3e8ff" },
    delivered: { color: "#16a34a", background: "#dcfce7" },
  },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "2px solid #e2e8f0",
    fontSize: 13,
    marginRight: 6,
    cursor: "pointer",
    background: "#ffffff",
    fontWeight: 600,
  },
  banned: {
    color: "#dc2626",
    fontWeight: 800,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  active: {
    color: "#16a34a",
    fontWeight: 800,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  searchRow: {
    marginBottom: 24,
  },
  searchInput: {
    padding: "14px 20px",
    borderRadius: 12,
    border: "2px solid #e2e8f0",
    width: "100%",
    maxWidth: "400px",
    fontSize: 15,
    outline: "none",
    transition: "all 0.3s ease",
    background: "#ffffff",
    fontFamily: "inherit",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 28,
    padding: "20px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
    backdropFilter: "blur(10px)",
    borderRadius: 12,
    border: "1px solid rgba(226, 232, 240, 0.8)",
  },
  paginationBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
  paginationText: {
    fontWeight: 600,
    fontSize: 15,
    color: "#334155",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
    marginTop: 24,
  },
  statCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: 28,
    borderRadius: 16,
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  statValue: {
    fontSize: 36,
    fontWeight: 800,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: "8px 0 0 0",
    letterSpacing: "-1px",
  },
  loading: {
    textAlign: "center",
    padding: 40,
    fontSize: 18,
    fontWeight: 600,
    color: "#64748b",
    background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    margin: "20px 0",
  },
};

const timelineStyles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    marginBottom: 32,
    paddingLeft: 12,
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    position: "relative",
  },
  line: {
    position: "absolute",
    left: 7,
    top: -24,
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    marginTop: 4,
    transition: "all 0.3s ease",
    border: "3px solid #ffffff",
  },
  label: {
    fontSize: 15,
    fontWeight: 600,
  },
  date: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: 400,
  },
};