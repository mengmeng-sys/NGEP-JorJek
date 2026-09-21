import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { mfaApiFetch } from "@/lib/apiClient";

export default function MfaSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, completeMfaSetup } = useAuth();

  const mfaToken = location.state?.mfaToken || null;
  const isMandatory = !!mfaToken;

  const [step, setStep] = useState("loading");
  const [secret, setSecret] = useState("");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isMandatory && !user) {
      navigate("/auth/login");
      return;
    }
    checkStatus();
  }, [user, isMandatory]);

  useEffect(() => {
    if (otpauthUri && canvasRef.current) {
      drawQrCode(otpauthUri);
    }
  }, [otpauthUri]);

  async function mfaSetupFetch(path, options = {}) {
    if (isMandatory) {
      return mfaApiFetch(mfaToken, path, options);
    }
    return authApi[path](...options);
  }

  async function checkStatus() {
    if (isMandatory) {
      await setup();
      return;
    }
    try {
      const status = await authApi.mfaStatus();
      if (status.enabled) {
        setStep("already-enabled");
      } else {
        await setup();
      }
    } catch {
      setStep("already-enabled");
    }
  }

  async function setup() {
    setLoading(true);
    try {
      let res;
      if (isMandatory) {
        res = await mfaApiFetch(mfaToken, "/auth/mfa/setup", { method: "POST" });
      } else {
        res = await authApi.mfaSetup();
      }
      setSecret(res.secret);
      setOtpauthUri(res.otpauthUri);
      setStep("scan");
    } catch (err) {
      setError(err?.message || "Failed to start setup. Please try again.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(e) {
    e.preventDefault();
    if (code.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      let res;
      if (isMandatory) {
        res = await mfaApiFetch(mfaToken, "/auth/mfa/enable", {
          method: "POST",
          body: { token: code },
        });
        if (res.token) {
          completeMfaSetup(res);
        }
      } else {
        res = await authApi.mfaEnable(code);
      }
      setBackupCodes(res.backupCodes);
      setStep("backup-codes");
    } catch (err) {
      setError(err?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      await authApi.mfaDisable(code);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Failed to disable.");
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    if (isMandatory) {
      navigate("/");
    } else {
      navigate("/");
    }
  }

  function drawQrCode(data) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";
    ctx.font = "12px monospace";
    ctx.fillText("Scan with Microsoft Authenticator", 10, size / 2 - 10);
    ctx.fillText("(QR library not loaded)", 25, size / 2 + 10);
    ctx.fillText("Or enter code manually:", 20, size / 2 + 30);
    ctx.font = "bold 10px monospace";
    ctx.fillText(data.substring(0, 40) + "...", 10, size - 10);
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen w-full bg-[#FBFBFB] dark:bg-gray-950 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (step === "already-enabled") {
    return (
      <div className="min-h-screen w-full bg-[#FBFBFB] dark:bg-gray-950 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Authenticator Enabled</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your account is protected with two-factor authentication.</p>

          <div className="space-y-2">
            <button
              onClick={() => setStep("disable")}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Disable Authenticator
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "disable") {
    return (
      <div className="min-h-screen w-full bg-[#FBFBFB] dark:bg-gray-950 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 space-y-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">Disable Authenticator</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Enter a verification code to disable 2FA.</p>

          <form onSubmit={(e) => { e.preventDefault(); handleDisable(); }} className="space-y-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="w-full bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-center tracking-widest text-gray-900 dark:text-gray-100 outline-none focus:border-[#FF4F00] transition-all"
            />
            {error && <p className="text-[11px] text-red-600 dark:text-red-400 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-red-50 dark:bg-red-900/200 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "scan") {
    return (
      <div className="min-h-screen w-full bg-[#FBFBFB] dark:bg-gray-950 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 space-y-5">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isMandatory ? "Secure Your Account" : "Set Up Authenticator"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isMandatory
                ? "You must set up two-factor authentication to continue"
                : "Scan the QR code with Microsoft Authenticator"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="border-2 border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-900">
              <canvas ref={canvasRef} className="w-48 h-48" />
            </div>

            <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Can't scan? Enter this code manually:</p>
              <p className="text-xs font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider break-all">{secret}</p>
            </div>
          </div>

          <form onSubmit={handleEnable} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">
                Enter 6-digit code from app
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-center tracking-[0.3em] text-gray-900 dark:text-gray-100 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all"
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "backup-codes") {
    return (
      <div className="min-h-screen w-full bg-[#FBFBFB] dark:bg-gray-950 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 space-y-5">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Authenticator Enabled!</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Save these backup codes in a safe place</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg p-3">
            <p className="text-[10px] text-amber-700 font-semibold mb-2">
              WARNING: Each code can only be used once. Store these somewhere safe.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {backupCodes.map((bc, i) => (
                <code key={i} className="text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-100 dark:border-gray-800">
                  {bc}
                </code>
              ))}
            </div>
          </div>

          <button
            onClick={handleDone}
            className="w-full bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
          >
            {isMandatory ? "Continue to Home" : "Done"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] dark:bg-gray-950 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 text-center space-y-3">
        <p className="text-xs text-red-600 dark:text-red-400">{error || "Something went wrong."}</p>
        <button onClick={() => navigate("/")} className="text-xs text-[#FF4F00] font-semibold hover:underline">
          Go Home
        </button>
      </div>
    </div>
  );
}
