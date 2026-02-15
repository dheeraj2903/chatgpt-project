import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

import GuestWrapper from "./components/chat/GuestWrapper";
import api from "./utils/api";

const AppRoutes = () => {
  const [user, setUser] = useState(undefined); 
  // undefined = अभी checking session
  // null = guest
  // object = logged in

  useEffect(() => {
    api
      .get("/api/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  // 🔥 Loader while checking session
  if (user === undefined) {
    return <div style={{ padding: 20 }}>Checking session...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Home हमेशा accessible */}
        <Route path="/" element={<Home />} />

        {/* ✅ Guest only pages */}
        <Route
          path="/login"
          element={
            <GuestWrapper user={user}>
              <Login />
            </GuestWrapper>
          }
        />

        <Route
          path="/register"
          element={
            <GuestWrapper user={user}>
              <Register />
            </GuestWrapper>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
