import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Route: "/signup". Owner: CS1. Self-reported role (student/professor)
// per project scope. Only @cadt.edu.kh emails are accepted (backend gate).
export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [cadtEmail, setCadtEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(cadtEmail, password, displayName, role);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-xl font-black text-gray-900 mb-1">Join jorjek.</h1>
        <p className="text-xs text-gray-500 mb-6">Use your university email to register.</p>

        <label className="block text-sm font-semibold text-gray-700 mb-1">University email</label>
        <input
          type="email"
          required
          className="mb-4 w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500"
          value={cadtEmail}
          onChange={(e) => setCadtEmail(e.target.value)}
          placeholder="you@cadt.edu.kh"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Display name</label>
        <input
          required
          className="mb-4 w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={6}
          className="mb-4 w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">I am a…</label>
        <select
          className="mb-4 w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:bg-white focus:border-orange-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="STUDENT">Student</option>
          <option value="PROFESSOR">Professor</option>
        </select>

        {error && <p className="text-xs font-semibold text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#FF4F00] hover:bg-[#E64700] transition-colors shadow-sm disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="mt-5 text-xs text-gray-500 font-medium text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#FF4F00] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}