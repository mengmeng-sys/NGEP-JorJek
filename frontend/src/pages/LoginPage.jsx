import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Route: "/login". Owner: CS1
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [cadtEmail, setCadtEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(cadtEmail, password);
      navigate(user.role === "SUPER_ADMIN" || user.role === "MODERATOR" ? "/admin" : "/");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-xl font-black text-gray-900 mb-1">Log in</h1>
        <p className="text-xs text-gray-500 mb-6">Use your university email and password.</p>

        <label className="block text-sm font-semibold text-gray-700 mb-1">University email</label>
        <input
          type="email"
          required
          className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500 mb-4"
          value={cadtEmail}
          onChange={(e) => setCadtEmail(e.target.value)}
          placeholder="you@cadt.edu.kh"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-xs font-semibold text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#FF4F00] hover:bg-[#E64700] transition-colors shadow-sm disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-5 text-xs text-gray-500 font-medium text-center">
          New to jorjek.?{" "}
          <Link to="/signup" className="font-bold text-[#FF4F00] hover:underline">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}