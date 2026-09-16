import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/config/msalConfig";

export default function MicrosoftAuthButton({ mode = "login", onSuccess, disabled = false }) {
  const { instance } = useMsal();

  const label = mode === "signup" ? "Sign up with Microsoft" : mode === "reset" ? "Verify with Microsoft" : "Sign in with Microsoft";

  const handleClick = async () => {
    try {
      const result = await instance.loginPopup(loginRequest);
      const email = result.account.username;
      onSuccess?.({ idToken: result.idToken, email, name: result.account.name });
    } catch (err) {
      console.error("Microsoft auth failed:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2.5 sm:py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1h10v10H1z" fill="#F25022"/>
        <path d="M12 1h10v10H12z" fill="#7FBA00"/>
        <path d="M1 12h10v10H1z" fill="#00A4EF"/>
        <path d="M12 12h10v10H12z" fill="#FFB900"/>
      </svg>
      {label}
    </button>
  );
}
