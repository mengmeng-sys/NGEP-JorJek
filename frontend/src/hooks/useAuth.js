import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Owner: CS1/CS2. Auth state is shared through React context so every
// component (Navbar, AuthModal, AdminLayout, pages) sees the same session.
// Restores the session from /users/me so the current user's role/status
// (needed for the Admin Dashboard RBAC) survives a page reload.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jorjek_token");
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch("/users/me")
      .then(setUser)
      .catch(() => localStorage.removeItem("jorjek_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(cadtEmail, password) {
    const { token } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ cadtEmail, password }),
    });
    localStorage.setItem("jorjek_token", token);
    const me = await apiFetch("/users/me");
    setUser(me);
    return me;
  }

  async function signup(cadtEmail, password, displayName) {
    const { token } = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ cadtEmail, password, displayName }),
    });
    localStorage.setItem("jorjek_token", token);
    const me = await apiFetch("/users/me");
    setUser(me);
    return me;
  }

  function logout() {
    localStorage.removeItem("jorjek_token");
    setUser(null);
  }

  const value = useMemo(() => {
    const isAdmin = Boolean(user && (user.role === "SUPER_ADMIN" || user.role === "MODERATOR"));
    return { user, loading, isAdmin, login, signup, logout };
  }, [user, loading]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}