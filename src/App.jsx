// import { useState } from "react";
// import Auth from "./Auth";
// import UserPanel from "./UserPanel";
// import AdminPanel from "./AdminPanel";

// export default function App() {
//   const [user,setUser]=useState(null);

//   if (!user) return <Auth setUser={setUser} />;

//   return user.role === "admin" ? <AdminPanel /> : <UserPanel />;
// }
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./Auth";
// import UserPanel from "./UserPanel";
import AdminPanel from "./AdminPanel";
import API from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Set token for API requests
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Fetch user profile
    API.get("/api/profile")
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token"); // invalid token
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: 100 }}>Loading...</div>;

  if (!user) return <Auth setUser={setUser} />;

  if (user.role === "admin") {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin/:page" element={<AdminPanel />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return <UserPanel />;
}
