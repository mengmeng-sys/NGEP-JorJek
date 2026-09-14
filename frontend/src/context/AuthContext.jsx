import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, usersApi } from "@/lib/api";
import { normalizeUser, handleFrom, initialsFrom } from "@/lib/adapters";

const AuthContext = createContext(null);

/** Legacy constant kept for compatibility; real auth no longer falls back to it. */
export const DEFAULT_CADT_USER = {
  id: "usr_cadt_01",
  displayName: "Srun Vireak",
  handle: "srunvireak",
  initials: "SV",
  email: "srun.vireak@student.cadt.edu.kh",
  role: "STUDENT",
  department: "Computer Science & Software Engineering",
  gender: "Male",
  dateOfBirth: "2004-05-14",
  karma: 142,
  interests: ["#C++", "#SQL", "#Machine Learning"],
  isAvailableForMentoring: true,
};

function persistedUserOrDefault() {
  try {
    const saved = localStorage.getItem("jorjek_auth_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    localStorage.removeItem("jorjek_auth_user");
  }
  return null;
}

// Merge computed metadata (initials/handle) derived from the real display name.
function withUserMeta(user) {
  if (!user) return null;
  const name = user.displayName || user.display_name || "CADT Student";
  return {
    ...user,
    displayName: name,
    initials: user.initials || initialsFrom(name),
    handle: user.handle || handleFrom(name),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => withUserMeta(persistedUserOrDefault()));
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback((nextUser) => {
    try {
      if (nextUser) localStorage.setItem("jorjek_auth_user", JSON.stringify(nextUser));
      else localStorage.removeItem("jorjek_auth_user");
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const storeSession = useCallback((data) => {
    if (data?.token) localStorage.setItem("jorjek_token", data.token);
    if (data?.refreshToken) localStorage.setItem("jorjek_refresh_token", data.refreshToken);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("jorjek_token");
    localStorage.removeItem("jorjek_refresh_token");
    localStorage.removeItem("jorjek_auth_user");
  }, []);

  // Hydrate the account when a token already exists.
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("jorjek_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then((me) => {
        if (cancelled) return;
        const hydrated = withUserMeta(me);
        setUser(hydrated);
        persist(hydrated);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession, persist]);

  // The axios interceptor broadcasts this when a refresh fails (token revoked
  // or expired) — bounce the UI back to the logged-out state immediately.
  useEffect(() => {
    const onSessionExpired = () => {
      clearSession();
      setUser(null);
    };
    window.addEventListener("jorjek:session-expired", onSessionExpired);
    return () => window.removeEventListener("jorjek:session-expired", onSessionExpired);
  }, [clearSession]);

  const login = async (cadtEmail, password) => {
    const data = await authApi.login(cadtEmail, password);
    storeSession(data);
    const nextUser = withUserMeta(normalizeUser(data.user));
    setUser(nextUser);
    persist(nextUser);
    return nextUser;
  };

  const signupEmail = async (payload) => {
    const data = await authApi.signup(payload);
    storeSession(data);
    const nextUser = withUserMeta(normalizeUser(data.user));
    setUser(nextUser);
    persist(nextUser);
    return data;
  };

  const verifyEmail = async (cadtEmail, otp) => {
    const result = await authApi.verifyEmail(cadtEmail, otp);
    // The signup flow already holds tokens; re-fetch so the cached user's
    // emailVerified reflects the server state after a successful verify.
    try {
      const me = await authApi.me();
      const nextUser = withUserMeta(normalizeUser(me));
      setUser(nextUser);
      persist(nextUser);
    } catch {
      /* best effort — the account is verified server-side regardless */
    }
    return result;
  };

  const resendOtp = (cadtEmail) => authApi.resendOtp(cadtEmail);

  const forgotPassword = (cadtEmail) => authApi.forgotPassword(cadtEmail);

  const resetPassword = (cadtEmail, otp, newPassword) =>
    authApi.resetPassword(cadtEmail, otp, newPassword);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* best effort */
    } finally {
      clearSession();
      setUser(null);
    }
  };

  // Compatibility alias — log the user in with an already-fetched row.
  const completeSignup = (userData = {}, _selectedInterests = []) => {
    const nextUser = withUserMeta(normalizeUser(userData));
    if (nextUser?.id) {
      setUser(nextUser);
      persist(nextUser);
    }
    return nextUser;
  };

  const updateUserProfile = async (updatedFields = {}) => {
    if (!user?.id) return null;

    const optimistic = withUserMeta({ ...user, ...updatedFields });
    setUser(optimistic);
    persist(optimistic);

    try {
      const updated = await usersApi.update(user.id, updatedFields);
      const merged = withUserMeta(normalizeUser(updated));
      setUser(merged || optimistic);
      persist(merged || optimistic);
      return merged || optimistic;
    } catch {
      setUser(user);
      persist(user);
      throw new Error("Could not update your profile. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "SUPER_ADMIN" || user?.role === "MODERATOR",
        loading: isLoading,
        isLoading,
        setIsLoading,
        login,
        logout,
        completeSignup,
        updateUserProfile,
        signupEmail,
        verifyEmail,
        resendOtp,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};