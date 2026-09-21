import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";

export function SecurityTab() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.mfaStatus()
      .then((s) => setEnabled(s.enabled))
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
          Add an extra layer of security using Microsoft Authenticator
        </p>
      </div>

      <div className={`border rounded-xl p-4 flex items-center justify-between ${enabled ? "border-green-200 bg-green-50" : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enabled ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-200 dark:bg-gray-700"}`}>
            {enabled ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {enabled ? "Authenticator is enabled" : "Authenticator is disabled"}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {enabled
                ? "Your account is protected with 2FA"
                : "Sign in with password + authenticator code"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/auth/mfa-setup")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            enabled
              ? "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50"
              : "bg-[#FF4F00] text-white hover:bg-[#E64700]"
          }`}
        >
          {enabled ? "Manage" : "Enable"}
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">How it works</h3>
        <ol className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-500 space-y-1.5 list-decimal list-inside">
          <li>Install Microsoft Authenticator on your phone</li>
          <li>Scan the QR code during setup</li>
          <li>Enter the 6-digit code from the app when signing in</li>
          <li>Store backup codes somewhere safe (for when you lose your phone)</li>
        </ol>
      </div>
    </div>
  );
}
