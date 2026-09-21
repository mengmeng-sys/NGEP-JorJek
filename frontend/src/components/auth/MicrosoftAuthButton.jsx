import React, { useState, useEffect } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "@/config/msalConfig";

export function useMicrosoftAuth() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [error, setError] = useState("");

  useEffect(() => {
    instance.handleRedirectPromise().catch((err) => {
      if (err?.errorCode) setError(err.errorCode);
    });
  }, [instance]);

  const login = async () => {
    setError("");
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      setError(err?.errorCode || "login_failed");
    }
  };

  const acquireToken = async () => {
    try {
      const result = await instance.acquireTokenSilent(loginRequest);
      return result;
    } catch {
      await instance.acquireTokenRedirect(loginRequest);
      return null;
    }
  };

  const getAccount = () => {
    return instance.getAllAccounts()[0] || null;
  };

  return { login, acquireToken, getAccount, isAuthenticated, inProgress, error };
}

export default function MicrosoftAuthButton({ mode = "login", disabled = false }) {
  const { login, inProgress, error } = useMicrosoftAuth();

  const label =
    mode === "signup"
      ? "Sign up with Microsoft"
      : mode === "reset"
      ? "Verify with Microsoft"
      : "Sign in with Microsoft";

  return (
    <div>
      <button
        type="button"
        onClick={login}
        disabled={disabled || inProgress !== "none"}
<<<<<<< HEAD
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 sm:py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
=======
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 sm:py-3 text-xs font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 hover:border-gray-400 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
>>>>>>> 9489f93e3d75a63466e6f645e63fc574909f890b
      >
        <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1h10v10H1z" fill="#F25022" />
          <path d="M12 1h10v10H12z" fill="#7FBA00" />
          <path d="M1 12h10v10H1z" fill="#00A4EF" />
          <path d="M12 12h10v10H12z" fill="#FFB900" />
        </svg>
        {inProgress !== "none" ? "Redirecting…" : label}
      </button>
      {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}
