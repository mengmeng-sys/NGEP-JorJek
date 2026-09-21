import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, usersApi } from "@/lib/api";
import { normalizeUser, handleFrom, initialsFrom } from "@/lib/adapters";
import { msalInstance } from "@/config/msalConfig";

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

function persistedOnboarding() {
  try {
    const saved = localStorage.getItem("jorjek_onboarding");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    localStorage.removeItem("jorjek_onboarding");
  }
  return { hasUpvoted: false, hasSaved: false, hasCommented: false };
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
  const [onboarding, setOnboarding] = useState(() => persistedOnboarding());

  const persist = useCallback((nextUser) => {
    try {
      if (nextUser) localStorage.setItem("jorjek_auth_user", JSON.stringify(nextUser));
      else localStorage.removeItem("jorjek_auth_user");
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const persistOnboarding = useCallback((next) => {
    try {
      localStorage.setItem("jorjek_onboarding", JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const markOnboardingComplete = useCallback((task) => {
    setOnboarding((prev) => {
      if (prev[task]) return prev;
      const next = { ...prev, [task]: true };
      persistOnboarding(next);
      return next;
    });
  }, [persistOnboarding]);

  const isOnboardingComplete = useCallback(() => {
    return onboarding.hasUpvoted && onboarding.hasSaved && onboarding.hasCommented;
  }, [onboarding]);

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
    if (data.mfaRequired) {
      return { mfaRequired: true, mfaToken: data.mfaToken };
    }
    storeSession(data);
    const nextUser = withUserMeta(normalizeUser(data.user));
    setUser(nextUser);
    persist(nextUser);
    return nextUser;
  };

  const forgotPassword = (email) => authApi.forgotPassword(email);

  const resetPassword = (email, otpCode, newPassword) =>
    authApi.resetPassword(email, otpCode, newPassword);

  const verifyMfa = async (mfaToken, totpCode) => {
    const data = await authApi.mfaValidate(mfaToken, totpCode);
    storeSession(data);
    const nextUser = withUserMeta(normalizeUser(data.user));
    setUser(nextUser);
    persist(nextUser);
    return nextUser;
  };

  const completeMfaSetup = (data) => {
    storeSession(data);
    const nextUser = withUserMeta(normalizeUser(data.user));
    setUser(nextUser);
    persist(nextUser);
    return nextUser;
  };

  const signupMicrosoft = async (payload) => {
    const data = await authApi.microsoftSignup(payload);
    storeSession(data);
    const nextUser = withUserMeta(normalizeUser(data.user));
    setUser(nextUser);
    persist(nextUser);
    return data;
  };

  const loginMicrosoft = async (idToken) => {
    const data = await authApi.microsoftLogin(idToken);
    storeSession(data);
    const nextUser = withUserMeta(normalizeUser(data.user));
    setUser(nextUser);
    persist(nextUser);
    return nextUser;
  };

  const resetPasswordMicrosoft = (idToken, newPassword) =>
    authApi.microsoftResetPassword(idToken, newPassword);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* best effort */
    } finally {
      clearSession();
      setUser(null);
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutRedirect({ account: accounts[0] }).catch(() => {});
      }
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
        signupMicrosoft,
        loginMicrosoft,
        resetPasswordMicrosoft,
        forgotPassword,
        resetPassword,
        verifyMfa,
        storeSession,
        completeMfaSetup,
        onboarding,
        markOnboardingComplete,
        isOnboardingComplete,
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