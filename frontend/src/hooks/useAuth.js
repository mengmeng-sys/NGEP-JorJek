import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";

// Owner: CS1/CS2. Minimal auth hook — expand as signup/login screens are built.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jorjek_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // TODO: fetch /users/me once that endpoint exists
    setLoading(false);
  }, []);

  async function login(cadtEmail, password) {
    const { token, user } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ cadtEmail, password }),
    });
    localStorage.setItem("jorjek_token", token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("jorjek_token");
    setUser(null);
  }

  return { user, loading, login, logout };
}
